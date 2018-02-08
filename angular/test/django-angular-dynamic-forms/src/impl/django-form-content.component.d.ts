import { ChangeDetectorRef, ElementRef, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, ValidatorFn } from '@angular/forms';
import { DynamicFormControlModel, DynamicFormService } from '@ng-dynamic-forms/core';
import 'rxjs/add/operator/merge';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from './error-service';
import { FieldConfig } from './django-form-iface';
/**
 * Form component targeted on django rest framework
 */
export declare class DjangoFormContentComponent implements OnInit {
    private formService;
    private httpClient;
    private error_service;
    private current_element;
    private check;
    form_model: DynamicFormControlModel[];
    private autocompleters;
    form_group: FormGroup;
    private last_id;
    /**
     * Returns submitted form data on enter
     *
     */
    submit_on_enter: EventEmitter<{}>;
    private _external_errors;
    private _initial_data;
    layout: FieldConfig[];
    errors: any;
    initial_data: any;
    constructor(formService: DynamicFormService, httpClient: HttpClient, error_service: ErrorService, current_element: ElementRef, check: ChangeDetectorRef);
    ngOnInit(): void;
    private _bind_autocomplete();
    private _trigger_validation();
    private _generate_ui_control_array(configs);
    private _generate_ui_control(field_config);
    private _update_initial_data();
    readonly valid: boolean;
    readonly value: any;
    on_submit_on_enter(): void;
}
export declare function external_validator(conf: {
    id: string;
    errors: any;
}): ValidatorFn;
