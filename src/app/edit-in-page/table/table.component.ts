import {Component, OnInit} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {ErrorService} from 'django-angular-dynamic-forms';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {catchError} from 'rxjs/operators';

@Component({
    selector: 'app-table',
    template: `
        <p>
            At first run any of the "create" examples to have data in this table.
        </p>

        <mat-table [dataSource]="data">
            <ng-container matColumnDef="name">
                <mat-header-cell *matHeaderCellDef>City</mat-header-cell>
                <mat-cell *matCellDef="let row"> {{ row.name }}</mat-cell>
            </ng-container>

            <ng-container matColumnDef="zipcode">
                <mat-header-cell *matHeaderCellDef> ZIP code</mat-header-cell>
                <mat-cell *matCellDef="let row">{{row.zipcode}}</mat-cell>
            </ng-container>

            <ng-container matColumnDef="comment">
                <mat-header-cell *matHeaderCellDef> Comment</mat-header-cell>
                <mat-cell *matCellDef="let row">{{row.comment}}</mat-cell>
            </ng-container>

            <ng-container matColumnDef="actions">
                <mat-header-cell *matHeaderCellDef> Actions</mat-header-cell>
                <mat-cell *matCellDef="let row">
                    <button mat-button color="primary" (click)="edit(row.id)">
                        <mat-icon>edit</mat-icon>
                    </button>
                </mat-cell>
            </ng-container>

            <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
        </mat-table>
    `,
    styles: []
})
export class TableComponent implements OnInit {

    data = new MatTableDataSource();
    displayedColumns = ['name', 'zipcode', 'comment', 'actions'];

    constructor(private http: HttpClient, private errors: ErrorService,
                private router: Router, private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.reload();
    }

    public reload() {
        this.http.get<any>('/api/1.0/cities/')
            .pipe(catchError(err => this.errors.showCommunicationError(err)))
            .subscribe(resp => {
                this.data = new MatTableDataSource(resp);
            });
    }

    edit(id: string) {
        this.router.navigate([id], {
            relativeTo: this.route
        });
    }
}
