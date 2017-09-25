import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {InternalDjangoFormBaseComponent} from './internal-django-form-base.component';

/**
 * Form component targeted on django rest framework
 */
@Component({
    selector: 'inpage-django-form',
    templateUrl: './inpage-django-form.component.html',
    styleUrls: ['./inpage-django-form.component.scss'],
})
export class InPageDjangoFormComponent extends InternalDjangoFormBaseComponent {

    constructor() {
        super();
    }
}
