import {Component, Inject} from '@angular/core';
import {DjangoFormBaseComponent} from './django-form-base.component';
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {ErrorService} from '@webui/errors/errors.service';

@Component({
    selector: 'dialog-django-form',
    templateUrl: './dialog-django-form.component.html',
    styleUrls: ['./dialog-django-form.component.scss']
})
export class DialogDjangoFormComponent extends DjangoFormBaseComponent {
    constructor(httpClient: HttpClient,
                snackBar: MatSnackBar,
                dialogRef: MatDialogRef<DialogDjangoFormComponent>,
                @Inject(MAT_DIALOG_DATA) data: any,
                translate: TranslateService,
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

        if (data.form_title) {
            translate.get(data.form_title).subscribe(translated => {
                this.form_title = translated || data.form_title;
            });
        }

        this.config = data.config;

        this.django_url = data.django_url;

        this.extra_form_data = data.extra_form_data;

        this.restrict_to_fields = data.fields;

        this.initial_data_transformation = data.initial_data_transformation;
    }
}
