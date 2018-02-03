import {Component, Inject} from '@angular/core';
import {DjangoFormBaseComponent} from './django-form-base.component';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {Http} from '@angular/http';

@Component({
    selector: 'dialog-django-form',
    templateUrl: './dialog-django-form.component.html',
    styleUrls: ['./dialog-django-form.component.scss'],
})
export class DialogDjangoFormComponent extends DjangoFormBaseComponent {

    constructor(http: Http, snackBar: MatSnackBar,
                dialogRef: MatDialogRef<DialogDjangoFormComponent>,
                @Inject(MAT_DIALOG_DATA) data: any) {
        super(http, snackBar);

        this.submit.subscribe(info => {
            info.cancel = false;
            dialogRef.close(info);
        });
        this.cancel.subscribe(info => {
            info.cancel = true;
            dialogRef.close(info);
        });

        this.form_title = data.form_title;
        this.config = data.config;
        this.django_url = data.django_url;
    }
}
