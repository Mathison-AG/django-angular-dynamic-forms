import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {FormGroup} from '@angular/forms';

import {DynamicFormControlModel} from '@ng-dynamic-forms/core';
import {DynamicFormService} from '@ng-dynamic-forms/core/src/service/dynamic-form.service';
import {DynamicInputModel} from '@ng-dynamic-forms/core/src/model/input/dynamic-input.model';
import {DynamicFormGroupModel} from '@ng-dynamic-forms/core/src/model/form-group/dynamic-form-group.model';

/**
 * Form component targeted on django rest framework
 */
@Component({
    selector: 'mat-button-group',
    templateUrl: './button-group.component.html',
    styleUrls: ['./button-group.component.scss'],
})
export class MatButtonGroupComponent implements OnInit {
    ngOnInit(): void {
    }
}
