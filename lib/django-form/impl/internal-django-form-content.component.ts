import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {AbstractControl, FormGroup, ValidatorFn} from '@angular/forms';

import {DynamicFormControlModel} from '@ng-dynamic-forms/core';
import {DynamicFormService} from '@ng-dynamic-forms/core/src/service/dynamic-form.service';
import {DynamicInputModel} from '@ng-dynamic-forms/core/src/model/input/dynamic-input.model';
import {DynamicFormGroupModel} from '@ng-dynamic-forms/core/src/model/form-group/dynamic-form-group.model';

/**
 * Form component targeted on django rest framework
 */
@Component({
    selector: 'internal-django-form-content',
    templateUrl: './internal-django-form-content.component.html',
    styleUrls: ['./internal-django-form-content.component.scss'],
})
export class InternalDjangoFormContentComponent implements OnInit {

    form_model: DynamicFormControlModel[] = [];
    form_group: FormGroup;
    private last_id = 0;

    /**
     * Returns submitted form data
     *
     * @type {EventEmitter<any>}
     */
    @Output()
    submit = new EventEmitter();

    private _external_errors = {};
    private _initial_data = null;

    @Input()
    set layout(_layout: any) {
        if (_layout) {
            this.form_model = [];

            const controls = this._generate_ui_control_array(_layout);
            this.form_model.push(...controls);

            if (this.form_group) {
                this.formService.addFormGroupControl(this.form_group, controls);
                this._update_initial_data();
            }
        }
    }

    @Input()
    set errors(_errors: any) {
        if (_errors) {
            Object.assign(this._external_errors, _errors);
            for (const error_name of Object.getOwnPropertyNames(_errors)) {
                const error_values = _errors[error_name];
                const error_model = this.formService.findById(error_name, this.form_model) as DynamicInputModel;
                // TODO: hack - do not know how to set up the validation message
                (error_model as any).external_error = error_values[0];
                // TODO: change this to support arrays
                const error_control = this.form_group.get(error_name);
                error_control.markAsDirty();
                error_control.markAsTouched();
                error_control.setValue(error_control.value);
            }
        } else {
            for (const prop of Object.getOwnPropertyNames(this._external_errors)) {
                delete this._external_errors[prop];
            }
        }
    }

    @Input()
    set initial_data(data: any) {
        this._initial_data = data;
        this._update_initial_data();
    }

    constructor(private formService: DynamicFormService) {
    }

    ngOnInit() {
        this.form_group = this.formService.createFormGroup(this.form_model);
        this._update_initial_data();
        this._trigger_validation();
    }

    private _trigger_validation() {
        Object.keys(this.form_group.controls).forEach(field => {
            const control = this.form_group.get(field);
            control.markAsTouched({onlySelf: true});
        });
    }

    private _generate_ui_control_array(configs: any[]): DynamicFormControlModel[] {
        const model: DynamicFormControlModel[] = [];
        for (const config of configs) {
            model.push(this._generate_ui_control(config));
        }
        return model;
    }

    private _generate_ui_control(config: any): DynamicFormControlModel {
        let id: string;
        let type: string;
        let label: string;
        let controls: any[];

        const config_is_array = Array.isArray(config);

        if (config_is_array) {
            if (config.find(x => Array.isArray(x))) {
                type = 'fieldset';
                if (typeof config[0] === 'string') {
                    label = config[0];
                    controls = config.slice(1);
                } else {
                    controls = config;
                }
            } else {
                id = config[0];
                label = config[1];
                type = config[2];
            }
        } else {
            id = config.id;
            label = config.label;
            type = config.type;
            controls = config.controls;
        }
        if (label === undefined) {
            label = '';
        }
        if (type === undefined) {
            type = 'string';
        }
        if (type === 'string') {
            return new DynamicInputModel({
                id: id,
                placeholder: label,
                validators: [
                    {
                        name: external_validator.name,
                        args: {id: id, errors: this._external_errors}
                    }
                ],
                errorMessages: {
                    external_error: '{{external_error}}'
                }
            });
        } else if (type === 'fieldset') {
            return new DynamicFormGroupModel({
                id: 'generated_' + (this.last_id++),
                legend: label,
                group: this._generate_ui_control_array(controls)
            });
        } else {
            throw new Error(`No ui control model for ${type}`);
        }
    }

    private _update_initial_data() {
        if (this._initial_data && this.form_group) {
            console.log('setting initial data', this._initial_data);
            Object.keys(this.form_group.controls).forEach(name => {
                if (name in this._initial_data) {
                    this.form_group.controls[name].setValue(this._initial_data[name]);
                }
            });
        }
    }

    public get valid() {
        return this.form_group.valid;
    }

    public get value() {
        return this.form_group.value;
    }
}

export function external_validator(conf: { id: string, errors: any }): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
        console.log(control);
        if (conf.id in conf.errors) {
            const ret = {'external_error': {value: conf.errors[conf.id][0]}};
            delete conf.errors[conf.id];
            return ret;
        } else {
            return null;
        }
    };
}
