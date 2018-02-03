import {Component} from '@angular/core';
import {Http} from '@angular/http';
import {MatSnackBar} from '@angular/material';
import {DjangoFormBaseComponent} from './django-form-base.component';

@Component({
    selector: 'inpage-django-form',
    templateUrl: './inpage-django-form.component.html',
    styleUrls: ['./inpage-django-form.component.scss'],
})
export class InPageDjangoFormComponent extends DjangoFormBaseComponent {

    constructor(http: Http, snackBar: MatSnackBar) {
        super(http, snackBar);
    }
}
