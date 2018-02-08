import {Component, Inject} from '@angular/core';
import {DjangoFormBaseComponent} from './django-form-base.component';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {ErrorService} from './error-service';
import {DjangoDialogConfig} from '../django-form-iface';

@Component({
    selector: 'dialog-django-form',
    templateUrl: './dialog-django-form.component.html',
    styleUrls: ['./dialog-django-form.component.scss']
})
export class DialogDjangoFormComponent extends DjangoFormBaseComponent {
    constructor(httpClient: HttpClient,
                snackBar: MatSnackBar,
                dialogRef: MatDialogRef<DialogDjangoFormComponent>,
                @Inject(MAT_DIALOG_DATA) data: DjangoDialogConfig,
                error_service: ErrorService) {
        super(httpClient, snackBar, error_service);

        this.submit.subscribe(info => {
            info.cancel = false;
            dialogRef.close(info);
        });
        this.cancel.subscribe(info => {
            info.cancel = true;
            dialogRef.close(info);
        });

        if (!data.config && !data.django_url) {
            throw new Error('Please specify either config or django_url');
        }

        this.extra_form_data = data.extra_form_data;

        if (data.initial_data_transformation) {
            this.initial_data_transformation = data.initial_data_transformation;
        }

        if (data.config_transformation) {
            this.config_transformation = data.config_transformation;
        }

        if (data.form_id) {
            this.form_id = data.form_id;
        }

        if (data.config) {
            if (data.django_url) {
                this.extra_config = data.config;
            } else {
                this.config = data.config;
            }
        }

        if (data.django_url) {
            this.django_url = data.django_url;
        }
    }
}
