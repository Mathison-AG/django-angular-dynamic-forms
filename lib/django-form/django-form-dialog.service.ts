import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {MdDialog} from '@angular/material';
import {DialogDjangoFormComponent} from './impl/dialog-django-form.component';
import {Injectable} from '@angular/core';

@Injectable()
export class DjangoFormDialogService {

    constructor(private dialog: MdDialog) {
    }

    public open(django_url: string, submit?: (data, response) => void,
                cancel?: (data) => void,
                extra_options?: {config?: any, form_title?: string}) {

        const dialogRef = this.dialog.open(DialogDjangoFormComponent, {
            width: '250px',
            data: {
                django_url: django_url,
                config: extra_options ? extra_options.config : null,
                form_title: extra_options ? extra_options.form_title : null,
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result.cancel && cancel) {
                cancel(result.data);
            } else if (submit) {
                submit(result.data, result.response);
            }
        });
    }
}
