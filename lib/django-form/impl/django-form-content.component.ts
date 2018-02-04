import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {AbstractControl, FormGroup, ValidatorFn} from '@angular/forms';

import {
    DYNAMIC_FORM_CONTROL_INPUT_TYPE_DATE, DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER, DynamicCheckboxModel,
    DynamicFormControlModel, DynamicFormGroupModel, DynamicFormService, DynamicInputModel, DynamicRadioGroupModel,
    DynamicSelectModel, DynamicTextAreaModel
} from '@ng-dynamic-forms/core';
import 'rxjs/add/operator/merge';
import {HttpClient} from '@angular/common/http';

import {ErrorService} from './error-service';
import {
    CompositeFieldTypes, FieldConfig, FieldSetConfig, FloatFieldConfig, IntegerFieldConfig, RadioFieldConfig,
    SelectFieldConfig, SimpleFieldTypes, StringFieldConfig, TextAreaFieldConfig
} from './django-form-iface';


/**
 * Form component targeted on django rest framework
 */
@Component({
    selector: 'django-form-content',
    templateUrl: './django-form-content.component.html',
    styleUrls: ['./django-form-content.component.scss']
})
export class DjangoFormContentComponent implements OnInit {
    form_model: DynamicFormControlModel[] = [];
    form_layout = {};
    private autocompleters: AutoCompleter[] = [];
    form_group: FormGroup;
    private last_id = 0;

    /**
     * Returns submitted form data on enter
     *
     * @type {EventEmitter<any>}
     */
    @Output() submit_on_enter = new EventEmitter();

    private _external_errors = {};
    private _initial_data = null;

    @Input()
    set layout(_layout: FieldConfig[]) {
        if (_layout) {
            this.form_model = [];
            this.autocompleters = [];
            this.form_model = this._generate_ui_control_array(_layout);

            if (this.form_group) {
                this.form_group = this.formService.createFormGroup(this.form_model);
                this._bind_autocomplete();
                this._update_initial_data();
            }

            this.check.detectChanges();
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
                if (error_model) {
                    (error_model as any).external_error = error_values[0];
                }
                // TODO: change this to support arrays
                const error_control = this.form_group.get(error_name);
                if (error_control) {
                    error_control.markAsDirty();
                    error_control.markAsTouched();
                    error_control.setValue(error_control.value);
                } else {
                    console.log(`Can not set error of ${error_name} within`, this.form_group);
                }
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

    constructor(private formService: DynamicFormService, private httpClient: HttpClient,
                private error_service: ErrorService,
                private current_element: ElementRef,
                private check: ChangeDetectorRef) {
    }

    ngOnInit() {
        // create an empty form group, will be filled later
        if (!this.form_group) {
            this.form_group = this.formService.createFormGroup(this.form_model);
            this._bind_autocomplete();
        }
        this._trigger_validation();
    }

    private _bind_autocomplete() {
        for (const autocompleter of this.autocompleters) {
            const widget = this.form_group.get(this.formService.getPath(autocompleter.model));
            widget.valueChanges.subscribe(value => {
                autocompleter.change(widget, value, this.value);
            });
        }
    }

    private _trigger_validation() {
        if (this.form_group) {
            Object.keys(this.form_group.controls).forEach(field => {
                const control = this.form_group.get(field);
                control.markAsTouched({onlySelf: true});
            });
        }
    }

    private _generate_ui_control_array(configs: FieldConfig[]): DynamicFormControlModel[] {
        const model: DynamicFormControlModel[] = [];
        for (const config of configs) {
            const _control = this._generate_ui_control(config);
            if (_control) {
                model.push(_control);
            }
        }
        return model;
    }

    private _generate_ui_control(field_config: FieldConfig): DynamicFormControlModel {

        const id = field_config.id || '___undefined__id__at__config';

        if (field_config.layout) {
            this.form_layout[id] = field_config.layout;
        }
        const label = field_config.label || '';
        const type = field_config.type || SimpleFieldTypes.STRING;

        switch (type) {
            case SimpleFieldTypes.STRING:
                const model = new DynamicInputModel(
                    {
                        id: id,
                        placeholder: label,
                        required: field_config.required,
                        disabled: field_config.read_only,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            },
                            maxLength: (field_config as StringFieldConfig).max_length,
                            minLength: (field_config as StringFieldConfig).min_length
                        },
                        errorMessages: {
                            external_error: '{{external_error}}'
                        },
                        list: (field_config as StringFieldConfig).autocomplete_list
                    },
                    field_config.cls
                );
                if ((field_config as StringFieldConfig).autocomplete_list ||
                    (field_config as StringFieldConfig).autocomplete_url) {
                    this.autocompleters.push(
                        new AutoCompleter(this.httpClient, this.error_service,
                            (field_config as StringFieldConfig).autocomplete_list,
                            (field_config as StringFieldConfig).autocomplete_url,
                            model));
                }
                return model;
            case SimpleFieldTypes.TEXTAREA:
                return new DynamicTextAreaModel(
                    {
                        id: id,
                        placeholder: label,
                        required: field_config.required,
                        disabled: field_config.read_only,
                        rows: 5,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            },
                            maxLength: (field_config as TextAreaFieldConfig).max_length,
                            minLength: (field_config as TextAreaFieldConfig).min_length
                        },
                        errorMessages: {
                            external_error: '{{external_error}}'
                        },
                    },
                    field_config.cls
                );
            case SimpleFieldTypes.DATE:
                return new DynamicInputModel(
                    {
                        id: id,
                        placeholder: label,
                        inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_DATE,
                        required: field_config.required,
                        disabled: field_config.read_only,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            }
                        },
                        errorMessages: {
                            external_error: '{{external_error}}'
                        },
                    },
                    field_config.cls
                );
            case SimpleFieldTypes.INTEGER:
                return new DynamicInputModel(
                    {
                        id: id,
                        placeholder: label,
                        inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER,
                        required: field_config.required,
                        disabled: field_config.read_only,
                        min: (field_config as IntegerFieldConfig).min_value,
                        max: (field_config as IntegerFieldConfig).max_value,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            },
                            min: (field_config as IntegerFieldConfig).min_value,
                            max: (field_config as IntegerFieldConfig).max_value
                        },
                        errorMessages: {
                            external_error: '{{external_error}}',
                            min: `Value must be in range ${(field_config as IntegerFieldConfig).min_value} - ${(field_config as IntegerFieldConfig).max_value}`,
                            max: `Value must be in range ${(field_config as IntegerFieldConfig).min_value} - ${(field_config as IntegerFieldConfig).max_value}`
                        }
                    },
                    field_config.cls
                );
            case SimpleFieldTypes.FLOAT:
                return new DynamicInputModel(
                    {
                        id: id,
                        placeholder: label,
                        inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER,
                        required: field_config.required,
                        disabled: field_config.read_only,
                        min: (field_config as FloatFieldConfig).min_value,
                        max: (field_config as FloatFieldConfig).max_value,
                        step: 0.00000001,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            },
                            min: (field_config as FloatFieldConfig).min_value,
                            max: (field_config as FloatFieldConfig).max_value
                        },
                        errorMessages: {
                            external_error: '{{external_error}}',
                            min: `Value must be in range ${(field_config as FloatFieldConfig).min_value} - ${(field_config as FloatFieldConfig).max_value}`,
                            max: `Value must be in range ${(field_config as FloatFieldConfig).min_value} - ${(field_config as FloatFieldConfig).max_value}`
                        }
                    },
                    field_config.cls
                );
            case SimpleFieldTypes.BOOLEAN:
                return new DynamicCheckboxModel(
                    {
                        id: id,
                        label: label,
                        required: field_config.required,
                        disabled: field_config.read_only,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            }
                        },
                        errorMessages: {
                            external_error: '{{external_error}}'
                        }
                    },
                    field_config.cls
                );
            case SimpleFieldTypes.RADIO:
                return new DynamicRadioGroupModel(
                    {
                        id: id,
                        label: label,
                        options: (field_config as RadioFieldConfig).choices,
                        required: field_config.required,
                        disabled: field_config.read_only,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            }
                        },
                        errorMessages: {
                            external_error: '{{external_error}}'
                        }
                    },
                    field_config.cls
                );
            case SimpleFieldTypes.SELECT:
                return new DynamicSelectModel(
                    {
                        id: id,
                        placeholder: label,
                        options: (field_config as SelectFieldConfig).choices,
                        required: field_config.required,
                        disabled: field_config.read_only,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            }
                        },
                        errorMessages: {
                            external_error: '{{external_error}}'
                        }
                    },
                    field_config.cls
                );
            case CompositeFieldTypes.FIELDSET:
                return new DynamicFormGroupModel(
                    {
                        id: 'generated_' + this.last_id++,
                        label: label,
                        group: this._generate_ui_control_array((field_config as FieldSetConfig).controls)
                    },
                    field_config.cls
                );
            default:
                throw new Error(`No ui control model for ${type}`);
        }
    }

    private _update_initial_data() {
        if (this._initial_data && this.form_group) {
            Object.keys(this.form_group.controls).forEach(name => {
                if (name in this._initial_data) {
                    this.form_group.controls[name].setValue(this._initial_data[name]);
                }
            });
        }
    }

    public get valid() {
        if (this.form_group) {
            return this.form_group.valid;
        }
        return true;
    }

    public get value() {
        if (this.form_group) {
            return this.form_group.value;
        }
        return true;
    }

    public on_submit_on_enter() {
        this.submit_on_enter.next(this.value);
    }
}

export function external_validator(conf: { id: string; errors: any }): ValidatorFn {
    // noinspection JSUnusedLocalSymbols
    return (control: AbstractControl): { [key: string]: any } => {
        if (conf.id in conf.errors) {
            const ret = {external_error: {value: conf.errors[conf.id][0]}};
            delete conf.errors[conf.id];
            return ret;
        } else {
            return null;
        }
    };
}

class AutoCompleter {
    constructor(private http: HttpClient,
                private errors: ErrorService,
                private autocompletion_list: any[],
                private autocompletion_url: string,
                public model) {
    }

    public change(widget, value, form_value) {
        let filtered_list;
        if (this.autocompletion_url) {
            this.http
                .post<any[]>(this.autocompletion_url + '?query=' + encodeURIComponent(value), form_value)
                .catch(error => {
                    return this.errors.show_communication_error(error);
                })
                .subscribe(resp => {
                    filtered_list = resp.map(x => x.label);
                    this.model.list = filtered_list;
                });
        } else {
            filtered_list = this.autocompletion_list.filter(x => x.indexOf(value) >= 0);
            this.model.list = filtered_list;
        }
    }
}
