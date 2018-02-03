import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {MatDialog} from '@angular/material';
import {DialogDjangoFormComponent} from './impl/dialog-django-form.component';
import {Injectable} from '@angular/core';
import {isUndefined} from 'util';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class DjangoFormDialogService {
    constructor(private dialog: MatDialog) {
    }

    public open(django_url: string,
                extra_options?: {
                    submit?: (data, response) => void,
                    cancel?: (data) => void,
                    config?: any;
                    form_title?: string;
                    extra_form_data?: any;
                    fields?: string[],
                    initial_data_transformation? : (any) => any
                }) {

        if (!extra_options) {
            extra_options = {};
        }

        const dialogRef = this.dialog.open(DialogDjangoFormComponent, {
            // width: '250px',
            data: {
                django_url: django_url,
                config: extra_options.config,
                form_title: extra_options.form_title,
                extra_form_data: extra_options.extra_form_data || {},
                fields: extra_options.fields || [],
                initial_data_transformation: extra_options.initial_data_transformation
            }
        });

        return dialogRef
            .afterClosed()
            .map(result => result || {cancel: true, data: undefined})
            .do(result => {
                if (result.cancel && extra_options.cancel) {
                    extra_options.cancel(result.data);
                } else if (extra_options.submit) {
                    extra_options.submit(result.data, result.response);
                }
            });
    }
}
