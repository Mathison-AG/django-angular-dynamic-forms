import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {MatDialog} from '@angular/material';
import {DialogDjangoFormComponent} from './impl/dialog-django-form.component';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {DjangoDialogConfig, DjangoFormConfig} from './django-form-iface';

@Injectable()
export class DjangoFormDialogService {
    constructor(private dialog: MatDialog) {
    }

    public open(django_url: string,
                extra_options?: DjangoDialogConfig): Observable<any> {

        if (!extra_options) {
            extra_options = {};
        }

        const dialogRef = this.dialog.open(DialogDjangoFormComponent, {
            // width: '250px',
            data: {
                django_url: django_url,
                config: extra_options.config,
                extra_form_data: extra_options.extra_form_data || {},
                initial_data_transformation: extra_options.initial_data_transformation,
                config_transformation: extra_options.config_transformation,
                form_id: extra_options.form_id
            }
        });

        return dialogRef
            .afterClosed()
            .map(result => result || {cancel: true, data: undefined});
    }
}
