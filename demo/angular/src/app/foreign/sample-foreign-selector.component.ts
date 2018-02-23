import {Component, Inject, OnInit} from '@angular/core';
import {
    ForeignFieldLookupComponent, ForeignFieldLookupConfig, ForeignFieldLookupResult,
    ForeignFieldLookupComponentData
} from 'django-angular-dynamic-forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {debounceTime, distinctUntilChanged, mergeMap} from 'rxjs/operators';
import {map} from 'rxjs/operators';
import {merge} from 'rxjs/observable/merge';
import {of as observableOf} from 'rxjs/observable/of';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-sample-foreign-selector',
    template: `
        Write a few letters of the city name and then select the city. 
        You can also <button mat-button (click)="clear()">clear</button> the previous value:
        <form [formGroup]="form">
            <mat-input-container>
                <input formControlName="query" matInput placeholder="City name filter">
            </mat-input-container>
        </form>

        <table *ngIf="cities$ | async; let cities" class="mat-table">
            <ng-container *ngFor="let city of cities">
                <tr>
                    <td title="City name">{{ city.name }}</td>
                    <td title="ZIP code">{{city.zipcode}}</td>
                    <td rowspan="2">
                        <button mat-button (click)="select(city)">Select this city</button>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" title="comment">{{ city.comment }}</td>
                </tr>
            </ng-container>
        </table>
    `,
    styles: [
        `table {
            max-width: 300px;
            width: 100%;
            border-collapse: collapse;
        }`
    ]
})
export class SampleForeignSelectorComponent implements OnInit, ForeignFieldLookupComponent {

    public form: FormGroup;
    public cities$: Observable<any[]>;

    constructor(public dialogRef: MatDialogRef<ForeignFieldLookupComponent>,
                @Inject(MAT_DIALOG_DATA) public data: ForeignFieldLookupComponentData,
                formBuilder: FormBuilder,
                http: HttpClient) {

        this.form = formBuilder.group({query: []});
        this.cities$ = merge(
            this.form.valueChanges.pipe(
                map((val) => val.query as string),
                debounceTime(500),
            ),
            observableOf('')
        ).pipe(
            distinctUntilChanged(),
            // normally you would use a service here ...
            mergeMap((query) => http.get<any[]>(data.config.autocompleteUrl, {
                    params: {
                        query: query
                    }
                })
            )
        );
    }

    ngOnInit() {
    }

    select(city: any) {
        this.dialogRef.close([city]);
    }

    clear() {
        this.dialogRef.close([]);
    }
}
