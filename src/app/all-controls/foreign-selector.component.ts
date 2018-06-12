import {AfterContentInit, AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
    ForeignFieldLookupComponent, ForeignFieldLookupConfig, ForeignFieldLookupResult,
    ForeignFieldLookupComponentData
} from 'django-angular-dynamic-forms';
import {
    MAT_DIALOG_DATA, MatDialogRef, MatPaginator, MatSort, MatTableDataSource, PageEvent,
    Sort
} from '@angular/material';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable, merge, of as observableOf, combineLatest, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, mergeMap, tap, map} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-foreign-selector',
    template:
            `Write a few letters of the city name and then select the city.
    You can also
    <button mat-button (click)="clear()">clear</button> the previous value:

    <mat-table [dataSource]="dataSource" matSort>

        <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef mat-sort-header>
                <form [formGroup]="form">
                    <mat-form-field>
                        <input formControlName="query" matInput placeholder="City name filter">
                    </mat-form-field>
                </form>
            </mat-header-cell>
            <mat-cell *matCellDef="let row"> {{row.name}}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="zipcode">
            <mat-header-cell *matHeaderCellDef mat-sort-header> ZIP Code</mat-header-cell>
            <mat-cell *matCellDef="let row"> {{row.zipcode}}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="comment">
            <mat-header-cell *matHeaderCellDef mat-sort-header> Comment</mat-header-cell>
            <mat-cell *matCellDef="let row"> {{row.comment}}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="action">
            <mat-header-cell *matHeaderCellDef mat-sort-header></mat-header-cell>
            <mat-cell *matCellDef="let row">
                <button mat-button (click)="select(row)">select this</button>
            </mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: displayedColumns;">
        </mat-row>
    </mat-table>

    <mat-paginator [pageSizeOptions]="[5, 10]" [length]="itemCount"></mat-paginator>
    `,
    styles: [
            `table {
            max-width: 300px;
            width: 100%;
            border-collapse: collapse;
        }`
    ]
})
export class ForeignSelectorComponent implements OnInit, ForeignFieldLookupComponent, AfterViewInit, OnDestroy {
    public form: FormGroup;
    public displayedColumns = ['name', 'zipcode', 'comment', 'action'];
    public dataSource = new MatTableDataSource<any>([]);
    public itemCount = 0;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    private subscription: Subscription;


    constructor(public dialogRef: MatDialogRef<ForeignFieldLookupComponent>,
                @Inject(MAT_DIALOG_DATA) public data: ForeignFieldLookupComponentData,
                formBuilder: FormBuilder,
                private http: HttpClient) {

        this.form = formBuilder.group({query: []});
    }

    ngAfterViewInit(): void {

        console.log(this.paginator, this.sort);

        const filter$ = merge(
            this.form.valueChanges.pipe(
                map((val) => val.query as string),
                debounceTime(500),
            ),
            observableOf('')
        );

        const paginator$ = merge(
            this.paginator.page,
            // default
            observableOf({
                pageIndex: 0,
                pageSize: 5
            })) as Observable<PageEvent>;

        const sort$ = merge(
            this.sort.sortChange,
            // default
            observableOf({
                active: '',
                direction: ''
            })) as Observable<Sort>;

        this.subscription = combineLatest(filter$, paginator$, sort$).pipe(
            distinctUntilChanged(),
            map((x) => ({
                filter: x[0],
                paginator: x[1],
                sort: x[2]
            })),
            // normally you would use a service here ...
            mergeMap((opts) => this.http.get<any>(this.data.config.autocompleteUrl, {
                    params: {
                        query: opts.filter,
                        pageIndex: opts.paginator.pageIndex.toString(),
                        pageSize: opts.paginator.pageSize.toString(),
                        sortBy: opts.sort.active,
                        sortDirection: opts.sort.direction
                    }
                })
            )
        ).subscribe((cities) => {
            this.dataSource = new MatTableDataSource<any>(cities.items);
            this.itemCount = cities.length;
        });
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    select(city: any) {
        this.dialogRef.close([city]);
    }

    clear() {
        this.dialogRef.close([]);
    }
}
