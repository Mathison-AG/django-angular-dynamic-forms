import {ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {AbstractControl, FormGroup, ValidatorFn} from '@angular/forms';

import {
    DYNAMIC_FORM_CONTROL_INPUT_TYPE_DATE, DYNAMIC_FORM_CONTROL_INPUT_TYPE_FILE,
    DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER,
    DynamicCheckboxModel,
    DynamicFormControlModel,
    DynamicFormGroupModel,
    DynamicFormService,
    DynamicInputModel,
    DynamicRadioGroupModel,
    DynamicSelectModel, DynamicTextAreaModel
} from '@ng-dynamic-forms/core';
import 'rxjs/add/operator/merge';
import {isUndefined} from 'util';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';

// a big hack
import * as $ from 'jquery';
import {ErrorService} from '@webui/errors/errors.service';

interface IterPath {
    obj: any;
    field: any;
    value: any;
}

function* deep_iter(obj: any, path?: IterPath[]) {
    if (isUndefined(path)) {
        path = [];
    }
    if (obj) {
        if (obj instanceof Array) {
            for (const data in obj) {
                yield* deep_iter(obj[data], path);
            }
        } else {
            if ((obj as any).type != 'field') {
                yield {
                    value: obj,
                    path: path
                };
                if (path.length > 2) {
                    throw Error(`Too deep path ${path}, object ${JSON.stringify(obj)}`);
                }
                for (const key in obj) {
                    if (key == 'layout') {
                        continue;
                    }
                    const val = obj[key];
                    if (val !== Object(val)) {
                        // skip primitives
                        continue;
                    }
                    const lpath = [{obj: obj, field: key, value: val}, ...path];
                    yield* deep_iter(val, lpath);
                }
            }
        }
    }
}

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

    @Input()
    restrict_to_fields: string[];

    /**
     * Returns submitted form data on enter
     *
     * @type {EventEmitter<any>}
     */
    @Output() submit_on_enter = new EventEmitter();

    private _external_errors = {};
    private _initial_data = null;

    @Input()
    set layout(_layout: any) {
        if (_layout) {
            // do it a bit later to make sure that restrict_to_fields is set as well
            setTimeout(() => {
                const all_elements = Array.from<any>(deep_iter(_layout)).map(x => x.value);
                const layout_label_elements = all_elements.filter(x => x.label);
                const labels_to_translate = [...layout_label_elements.map(x => x.label)];
                for (const el of all_elements) {
                    if (el.choices && !el.prohibit_choice_translation) {
                        labels_to_translate.push(... el.choices.map(x => x.display_name));
                    }
                }
                this.translate.get(labels_to_translate).subscribe(translation => {
                    layout_label_elements.forEach(x => {
                        x.label = translation[x.label] || `!${x.label}`;
                    });
                    this.form_model = [];
                    this.autocompleters = [];
                    this.form_model = this._generate_ui_control_array(_layout, translation);

                    if (this.form_group) {
                        this.form_group = this.formService.createFormGroup(this.form_model);
                        this._bind_autocomplete();
                        this._update_initial_data();
                    }
                });
                this.check.detectChanges();
            }, 10);
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
                private translate: TranslateService, private error_service: ErrorService,
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

    private _generate_ui_control_array(configs: any[], translations): DynamicFormControlModel[] {
        const model: DynamicFormControlModel[] = [];
        for (const config of configs) {
            const _control = this._generate_ui_control(config, translations);
            if (_control) {
                model.push(_control);
            }
        }
        return model;
    }

    private _generate_ui_control(config: any, translations: any): DynamicFormControlModel {
        let id: string;
        let type: string;
        let label: string;
        let controls: any[];
        let required = false;
        let disabled = false;
        let min_value = undefined;
        let max_value = undefined;
        let max_length = undefined;
        let min_length = undefined;
        let autocomplete_list = undefined;
        let autocomplete_url = undefined;
        let cls = undefined;

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
            required = config.required;
            disabled = config.read_only;
            min_value = config.min_value;
            max_value = config.max_value;
            max_length = config.max_length;
            min_length = config.min_length;
            autocomplete_list = config.autocomplete_list;
            autocomplete_url = config.autocomplete_url;
            cls = config.cls;
        }
        if (!id) {
            id = '___undefined__id__at__config';
        }
        if (this.restrict_to_fields && this.restrict_to_fields.length && this.restrict_to_fields.indexOf(id) < 0) {
            return null;
        }
        if (config.layout) {
            this.form_layout[id] = config.layout;
        }
        if (label === undefined) {
            label = '';
        }
        if (type === undefined) {
            type = 'string';
        }
        const options = [];
        switch (type) {
            case 'string':
                const model = new DynamicInputModel(
                    {
                        id: id,
                        placeholder: label,
                        required: required,
                        disabled: disabled,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors }
                            },
                            maxLength: max_length,
                            minLength: min_length
                        },
                        errorMessages: {
                            external_error: '{{external_error}}'
                        },
                        list: autocomplete_list
                    },
                    cls
                );
                if (autocomplete_list || autocomplete_url) {
                    this.autocompleters.push(new AutoCompleter(this.httpClient, this.error_service,
                        autocomplete_list, autocomplete_url, model));
                }
                return model;
            case 'textarea':
                return new DynamicTextAreaModel(
                    {
                        id: id,
                        placeholder: label,
                        required: required,
                        disabled: disabled,
                        rows: 5,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            },
                            maxLength: max_length,
                            minLength: min_length
                        },
                        errorMessages: {
                            external_error: '{{external_error}}'
                        },
                    },
                    cls
                );
            case 'file':
                return new DynamicInputModel(
                    {
                        id: id,
                        placeholder: label,
                        required: required,
                        disabled: disabled,
                        inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_FILE,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            },
                        },
                        errorMessages: {
                            external_error: '{{external_error}}'
                        },
                    },
                    cls
                );
            case 'date':
                return new DynamicInputModel(
                    {
                        id: id,
                        placeholder: label,
                        inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_DATE,
                        required: required,
                        disabled: disabled,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            }
                        },
                        errorMessages: {
                            external_error: '{{external_error}}'
                        },
                        list: autocomplete_list
                    },
                    cls
                );
            case 'integer':
                return new DynamicInputModel(
                    {
                        id: id,
                        placeholder: label,
                        inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER,
                        required: required,
                        disabled: disabled,
                        min: min_value,
                        max: max_value,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            },
                            min: min_value,
                            max: max_value
                        },
                        errorMessages: {
                            external_error: '{{external_error}}',
                            min: `Value must be in range ${min_value} - ${max_value}`,
                            max: `Value must be in range ${min_value} - ${max_value}`
                        }
                    },
                    cls
                );
            case 'float':
                return new DynamicInputModel(
                    {
                        id: id,
                        placeholder: label,
                        inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER,
                        required: required,
                        disabled: disabled,
                        min: min_value,
                        max: max_value,
                        step: 0.00000001,
                        validators: {
                            external_validator: {
                                name: external_validator.name,
                                args: {id: id, errors: this._external_errors}
                            },
                            min: min_value,
                            max: max_value
                        },
                        errorMessages: {
                            external_error: '{{external_error}}',
                            min: `Value must be in range ${min_value} - ${max_value}`,
                            max: `Value must be in range ${min_value} - ${max_value}`
                        }
                    },
                    cls
                );
            case 'boolean':
                return new DynamicCheckboxModel(
                    {
                        id: id,
                        label: label,
                        required: required,
                        disabled: disabled,
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
                    cls
                );
            case 'radio':
                for (const option of config.choices) {
                    let label = option.display_name;
                    if (!config.prohibit_choice_translation) {
                        label = translations[label] || label;
                    }
                    options.push({
                        label: label,
                        value: option.value
                    });
                }
                return new DynamicRadioGroupModel(
                    {
                        id: id,
                        label: label,
                        options: options,
                        required: required,
                        disabled: disabled,
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
                    cls
                );
            case 'choice':
                if (config.choices) {
                    for (const option of config.choices) {
                        let label = option.display_name;
                        if (!config.prohibit_choice_translation) {
                            label = translations[label] || label;
                        }
                        options.push({
                            label: label,
                            value: option.value
                        });
                    }
                }
                return new DynamicSelectModel(
                    {
                        id: id,
                        placeholder: label,
                        options: options,
                        required: required,
                        disabled: disabled,
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
                    cls
                );
            case 'fieldset':
                return new DynamicFormGroupModel(
                    {
                        id: 'generated_' + this.last_id++,
                        label: label,
                        group: this._generate_ui_control_array(controls, translations)
                    },
                    cls
                );
            case 'field':
                // do not render inline models yet ...
                return null;
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
            const ret = this.form_group.value;

            // big hack for html editor
            for (let key in this.form_layout) {
                const lay = this.form_layout[key];
                if (lay && lay.element && lay.element.control == 'html-editor') {
                    // ok, there is an html editor there
                    const new_val = $('#' + key).val();
                    ret[key] = new_val;
                }
            }
            return ret;
        }
        return true;
    }

    public on_submit_on_enter() {
        this.submit_on_enter.next(this.value);
    }

    public clear_autocompleters() {
        // this is a hack - clear button should clear only the autocompleter with the current value
        for (const autocompleter of this.autocompleters) {
            autocompleter.change(null, '', '');
        }
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
