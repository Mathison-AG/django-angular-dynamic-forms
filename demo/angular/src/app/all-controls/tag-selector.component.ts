import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {
    ForeignFieldLookupComponent,
    ForeignFieldLookupComponentData,
    ForeignFieldLookupConfig,
    ForeignFieldLookupResult
} from 'django-angular-dynamic-forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-tag-selector',
    template:
            `
        <p>Choose the best british agents and click "Save" to remember your selection:</p>
        <div>
            <div *ngFor="let tag of tags">
                <mat-slide-toggle [(ngModel)]="tag.selected">{{tag.name}}</mat-slide-toggle>
            </div>
        </div>

        <button mat-button (click)="save()">Save</button>
    `,
    styles: [
            `
            p {
                padding-bottom: 20px;
            }

            button {
                margin-top: 20px;
            }

            div {
                margin-left: 20px;
            }
        `
    ]
})
export class TagSelectorComponent implements ForeignFieldLookupComponent, AfterViewInit {

    public tags: any[] = [];

    constructor(public dialogRef: MatDialogRef<ForeignFieldLookupComponent>,
                @Inject(MAT_DIALOG_DATA) public data: ForeignFieldLookupComponentData,
                private http: HttpClient) {
        console.log('data', data);
    }

    ngAfterViewInit(): void {
        this.http.get<any>(this.data.config.autocompleteUrl).subscribe((tags) => {
            this.tags = tags.map((tag) => ({
                ...tag,
                selected: this.data.initialValue.some((t) => tag.id === t.id)
            }));
        });
    }

    save() {
        const result = this.tags
            .filter((tag) => tag.selected);
        console.log(result);
        this.dialogRef.close(result);
    }
}
