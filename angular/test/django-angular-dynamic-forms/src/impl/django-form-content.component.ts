import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {AbstractControl, FormArray, FormGroup, ValidatorFn} from '@angular/forms';

import {
    DYNAMIC_FORM_CONTROL_INPUT_TYPE_DATE, DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER, DynamicCheckboxModel,
    DynamicFormControlLayout,
    DynamicFormControlModel, DynamicFormGroupModel, DynamicFormService, DynamicInputModel, DynamicRadioGroupModel,
    DynamicSelectModel, DynamicTextAreaModel
} from '@ng-dynamic-forms/core';
import 'rxjs/add/operator/merge';
import {HttpClient} from '@angular/common/http';

import {ErrorService} from './error-service';
import {
    ColumnsFieldConfig,
    CompositeFieldTypes, EmailFieldConfig, FieldConfig, FieldSetConfig, FloatFieldConfig, IntegerFieldConfig,
    RadioFieldConfig,
    SelectFieldConfig, SimpleFieldTypes, StringFieldConfig, TextAreaFieldConfig
} from './django-form-iface';
import {DynamicFormControlLayoutConfig} from '@ng-dynamic-forms/core/src/model/misc/dynamic-form-control-layout.model';


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
    private autocompleters: AutoCompleter[] = [];
    form_group: FormGroup;
    private last_id = 0;

    /**
     * Returns submitted form data on enter
     *
     */
    @Output() submit_on_enter = new EventEmitter();

    private _external_errors: { [s: string]: any; } = {};
    private _initial_data: any = null;

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
                const error_control = this.getControlByName(error_name);
                if (error_control) {
                    error_control.markAsDirty();
                    error_control.markAsTouched();
                    error_control.setValue(error_control.value);
                } else {
                    console.log(`Can not set error of ${error_name} within`, this.form_group, error_model);
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
            this._update_initial_data();
        }
        this._trigger_validation();
        this.check.detectChanges();
    }

    private _bind_autocomplete() {
        for (const autocompleter of this.autocompleters) {
            const widget = this.form_group.get(this.formService.getPath(autocompleter.model));
            if (widget) {
                widget.valueChanges.subscribe(value => {
                    autocompleter.change(widget, value, this.value);
                });
            }
        }
    }

    private _trigger_validation() {
        if (this.form_group) {
            Object.keys(this.form_group.controls).forEach(field => {
                const control = this.form_group.get(field);
                if (control) {
                    control.markAsTouched({onlySelf: true});
                }
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
        const label = field_config.label || '';
        const type = field_config.type || SimpleFieldTypes.STRING;

        switch (type) {
            case SimpleFieldTypes.STRING: {
                const sfc = field_config as StringFieldConfig;
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
                            maxLength: sfc.max_length,
                            minLength: sfc.min_length
                        },
                        errorMessages: {
                            external_error: '{{external_error}}'
                        },
                        list: sfc.autocomplete_list
                    },
                    field_config.layout
                );
                if (sfc.autocomplete_list ||
                    sfc.autocomplete_url) {
                    this.autocompleters.push(
                        new AutoCompleter(this.httpClient, this.error_service,
                            sfc.autocomplete_list,
                            sfc.autocomplete_url,
                            model));
                }
                return model;
            }
            case SimpleFieldTypes.EMAIL: {
                const sfc = field_config as EmailFieldConfig;
                const model = new DynamicInputModel(
                    {
                        id: id,
                        placeholder: label,
                        required: field_config.required,
                        disabled: field_config.read_only,
                        inputType: 'email',
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            },
                            maxLength: sfc.max_length,
                            minLength: sfc.min_length
                        },
                        errorMessages: {
                            external_error: '{{external_error}}'
                        },
                        list: sfc.autocomplete_list
                    },
                    field_config.layout
                );
                if (sfc.autocomplete_list ||
                    sfc.autocomplete_url) {
                    this.autocompleters.push(
                        new AutoCompleter(this.httpClient, this.error_service,
                            sfc.autocomplete_list,
                            sfc.autocomplete_url,
                            model));
                }
                return model;
            }
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
                    field_config.layout
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
                    field_config.layout
                );
            case SimpleFieldTypes.INTEGER:
                const ifc = (field_config as IntegerFieldConfig);
                return new DynamicInputModel(
                    {
                        id: id,
                        placeholder: label,
                        inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER,
                        required: field_config.required,
                        disabled: field_config.read_only,
                        min: ifc.min_value,
                        max: ifc.max_value,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            },
                            min: ifc.min_value,
                            max: ifc.max_value
                        },
                        errorMessages: {
                            external_error: '{{external_error}}',
                            min: `Value must be in range ${ifc.min_value} - ${ifc.max_value}`,
                            max: `Value must be in range ${ifc.min_value} - ${ifc.max_value}`
                        }
                    },
                    field_config.layout
                );
            case SimpleFieldTypes.FLOAT:
                const ffc = (field_config as FloatFieldConfig);
                return new DynamicInputModel(
                    {
                        id: id,
                        placeholder: label,
                        inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER,
                        required: field_config.required,
                        disabled: field_config.read_only,
                        min: ffc.min_value,
                        max: ffc.max_value,
                        step: 0.00000001,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            },
                            min: ffc.min_value,
                            max: ffc.max_value
                        },
                        errorMessages: {
                            external_error: '{{external_error}}',
                            min: `Value must be in range ${ffc.min_value} - ${ffc.max_value}`,
                            max: `Value must be in range ${ffc.min_value} - ${ffc.max_value}`
                        }
                    },
                    field_config.layout
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
                    field_config.layout
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
                    field_config.layout
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
                    field_config.layout
                );
            case CompositeFieldTypes.FIELDSET:
                const fieldset_layout = merge_layouts(field_config.layout, {
                    grid: {
                        label: 'darf-fieldset'
                    }
                });
                return new DynamicFormGroupModel(
                    {
                        id: 'generated_' + this.last_id++,
                        label: label,
                        group: this._generate_ui_control_array((field_config as FieldSetConfig).controls)
                    },
                    fieldset_layout
                );
            case CompositeFieldTypes.GROUP: {
                const group_layout = merge_layouts(field_config.layout, {
                    grid: {
                        label: 'group'
                    }
                });
                return new DynamicFormGroupModel(
                    {
                        id: 'generated_' + this.last_id++,
                        group: this._generate_ui_control_array((field_config as FieldSetConfig).controls)
                    },
                    group_layout
                );
            }
            case CompositeFieldTypes.COLUMNS: {
                const csf = (field_config as ColumnsFieldConfig);
                const model: DynamicFormControlModel[] = [];
                for (const config of csf.controls) {
                    const _control = this._generate_ui_control(
                        {
                            ...config,
                            layout: merge_layouts(config.layout,
                                {
                                    grid: {
                                        host: `darf-column-${csf.controls.length}`
                                    }
                                }
                            )
                        });
                    if (_control) {
                        model.push(_control);
                    }
                }

                return new DynamicFormGroupModel(
                    {
                        id: 'generated_' + this.last_id++,
                        group: model
                    },
                    merge_layouts(
                        field_config.layout,
                        {
                            grid: {
                                control: `darf-columns darf-columns-${csf.controls.length}`
                            },
                            // element: {
                            //     container: '---container',
                            //     control: '---control',
                            //     errors: '---errors',
                            //     group: '---group',
                            //     hint: '---hint',
                            //     host: '---host',
                            //     label: '---label',
                            //     option: '---option'
                            // }
                        }
                    )
                );
            }
            default:
                throw new Error(`No ui control model for ${type}`);
        }
    }

    private _update_initial_data() {
        if (this._initial_data && this.form_group) {
            Object.keys(this.form_group.controls).forEach(name => {
                if (this._initial_data) {
                    if (name in this._initial_data) {
                        this.form_group.controls[name].setValue(this._initial_data[name]);
                    }
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

    private getControlByName(name: string): AbstractControl|undefined {
        function getControl(control: AbstractControl, controlName: string): AbstractControl|undefined {
            let ret: AbstractControl|undefined;
            if (control instanceof FormGroup) {
                const formGroup = control as FormGroup;
                for (const childName in formGroup.controls) {
                    if (formGroup.controls.hasOwnProperty(childName)) {
                        const childControl = formGroup.controls[childName];
                        if (childName === controlName) {
                            return childControl;
                        } else {
                            ret = getControl(childControl, controlName);
                            if (ret) {
                                return ret;
                            }
                        }
                    }
                }
            }
            if (control instanceof FormArray) {
                console.error('Arrays are not yet supported !');
            }
        }

        return getControl(this.form_group, name);
    }
}

export function external_validator(conf: { id: string; errors: any }): ValidatorFn {
    // noinspection JSUnusedLocalSymbols
    return (_control: AbstractControl): { [key: string]: any } => {
        if (conf.id in conf.errors) {
            const ret = {external_error: {value: conf.errors[conf.id][0]}};
            delete conf.errors[conf.id];
            return ret;
        } else {
            return {};
        }
    };
}

class AutoCompleter {
    constructor(private http: HttpClient,
                private errors: ErrorService,
                private autocompletion_list: any[] | undefined,
                private autocompletion_url: string | undefined,
                public model: any) {
    }

    public change(_widget: any, value: string, form_value: string) {
        let filtered_list;
        if (this.autocompletion_url) {
            this.http
                .post<any[]>(this.autocompletion_url + '?query=' + encodeURIComponent(value), form_value)
                .catch(error => {
                    return this.errors.show_communication_error(error);
                })
                .subscribe(resp => {
                    resp = resp || [];
                    filtered_list = resp.map(x => x.label);
                    this.model.list = filtered_list;
                });
        } else {
            if (this.autocompletion_list) {
                filtered_list = this.autocompletion_list.filter(x => x.indexOf(value) >= 0);
                this.model.list = filtered_list;
            } else {
                this.model.list = [];
            }
        }
    }
}

function merge_layouts(layout1_or_undefined: DynamicFormControlLayout | undefined,
                       layout2_or_undefined: DynamicFormControlLayout | undefined): DynamicFormControlLayout | undefined {

    if (layout1_or_undefined === undefined) {
        return layout2_or_undefined;
    }
    if (layout2_or_undefined === undefined) {
        return layout1_or_undefined;
    }

    function merge_classes(clz1_or_undefined: DynamicFormControlLayoutConfig | undefined,
                           clz2_or_undefined: DynamicFormControlLayoutConfig | undefined) {
        if (clz1_or_undefined === undefined) {
            return clz2_or_undefined;
        }
        if (clz2_or_undefined === undefined) {
            return clz1_or_undefined;
        }

        const clz1 = clz1_or_undefined as DynamicFormControlLayoutConfig;
        const clz2 = clz2_or_undefined as DynamicFormControlLayoutConfig;

        const classes_ret: DynamicFormControlLayoutConfig = {...clz2};

        for (const arg in clz1) {
            if (classes_ret[arg]) {
                classes_ret[arg] = `${classes_ret[arg]} ${clz1[arg]}`;
            } else {
                classes_ret[arg] = clz1[arg];
            }
        }
        return classes_ret;
    }

    const layout1 = layout1_or_undefined as DynamicFormControlLayout;
    const layout2 = layout2_or_undefined as DynamicFormControlLayout;

    const ret = {
        ...layout2,
        ...layout1
    };
    const grid = merge_classes(layout1.grid, layout2.grid);
    const element = merge_classes(layout1.element, layout2.element);
    if (grid) {
        ret.grid = grid;
    }
    if (element) {
        ret.element = element;
    }
    return ret;
}
