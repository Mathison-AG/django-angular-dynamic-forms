"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var core_2 = require("@ng-dynamic-forms/core");
require("rxjs/add/operator/merge");
var http_1 = require("@angular/common/http");
var error_service_1 = require("./error-service");
var django_form_iface_1 = require("./django-form-iface");
/**
 * Form component targeted on django rest framework
 */
var DjangoFormContentComponent = /** @class */ (function () {
    function DjangoFormContentComponent(formService, httpClient, error_service, current_element, check) {
        this.formService = formService;
        this.httpClient = httpClient;
        this.error_service = error_service;
        this.current_element = current_element;
        this.check = check;
        this.form_model = [];
        this.autocompleters = [];
        this.last_id = 0;
        /**
         * Returns submitted form data on enter
         *
         */
        this.submit_on_enter = new core_1.EventEmitter();
        this._external_errors = {};
        this._initial_data = null;
    }
    Object.defineProperty(DjangoFormContentComponent.prototype, "layout", {
        set: function (_layout) {
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DjangoFormContentComponent.prototype, "errors", {
        set: function (_errors) {
            if (_errors) {
                Object.assign(this._external_errors, _errors);
                for (var _i = 0, _a = Object.getOwnPropertyNames(_errors); _i < _a.length; _i++) {
                    var error_name = _a[_i];
                    var error_values = _errors[error_name];
                    var error_model = this.formService.findById(error_name, this.form_model);
                    // TODO: hack - do not know how to set up the validation message
                    if (error_model) {
                        error_model.external_error = error_values[0];
                    }
                    // TODO: change this to support arrays
                    var error_control = this.form_group.get(error_name);
                    if (error_control) {
                        error_control.markAsDirty();
                        error_control.markAsTouched();
                        error_control.setValue(error_control.value);
                    }
                    else {
                        console.log("Can not set error of " + error_name + " within", this.form_group);
                    }
                }
            }
            else {
                for (var _b = 0, _c = Object.getOwnPropertyNames(this._external_errors); _b < _c.length; _b++) {
                    var prop = _c[_b];
                    delete this._external_errors[prop];
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DjangoFormContentComponent.prototype, "initial_data", {
        set: function (data) {
            console.log('set initial data', data);
            this._initial_data = data;
            this._update_initial_data();
        },
        enumerable: true,
        configurable: true
    });
    DjangoFormContentComponent.prototype.ngOnInit = function () {
        // create an empty form group, will be filled later
        if (!this.form_group) {
            this.form_group = this.formService.createFormGroup(this.form_model);
            this._bind_autocomplete();
            this._update_initial_data();
        }
        this._trigger_validation();
        this.check.detectChanges();
    };
    DjangoFormContentComponent.prototype._bind_autocomplete = function () {
        var _this = this;
        var _loop_1 = function (autocompleter) {
            var widget = this_1.form_group.get(this_1.formService.getPath(autocompleter.model));
            if (widget) {
                widget.valueChanges.subscribe(function (value) {
                    autocompleter.change(widget, value, _this.value);
                });
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = this.autocompleters; _i < _a.length; _i++) {
            var autocompleter = _a[_i];
            _loop_1(autocompleter);
        }
    };
    DjangoFormContentComponent.prototype._trigger_validation = function () {
        var _this = this;
        if (this.form_group) {
            Object.keys(this.form_group.controls).forEach(function (field) {
                var control = _this.form_group.get(field);
                if (control) {
                    control.markAsTouched({ onlySelf: true });
                }
            });
        }
    };
    DjangoFormContentComponent.prototype._generate_ui_control_array = function (configs) {
        var model = [];
        for (var _i = 0, configs_1 = configs; _i < configs_1.length; _i++) {
            var config = configs_1[_i];
            var _control = this._generate_ui_control(config);
            if (_control) {
                model.push(_control);
            }
        }
        return model;
    };
    DjangoFormContentComponent.prototype._generate_ui_control = function (field_config) {
        var id = field_config.id || '___undefined__id__at__config';
        var label = field_config.label || '';
        var type = field_config.type || django_form_iface_1.SimpleFieldTypes.STRING;
        switch (type) {
            case django_form_iface_1.SimpleFieldTypes.STRING:
                var sfc = field_config;
                var model = new core_2.DynamicInputModel({
                    id: id,
                    placeholder: label,
                    required: field_config.required,
                    disabled: field_config.read_only,
                    validators: {
                        external_validator: {
                            name: external_validator.name,
                            args: { id: id, errors: this._external_errors }
                        },
                        maxLength: sfc.max_length,
                        minLength: sfc.min_length
                    },
                    errorMessages: {
                        external_error: '{{external_error}}'
                    },
                    list: sfc.autocomplete_list
                }, field_config.layout);
                if (sfc.autocomplete_list ||
                    sfc.autocomplete_url) {
                    this.autocompleters.push(new AutoCompleter(this.httpClient, this.error_service, sfc.autocomplete_list, sfc.autocomplete_url, model));
                }
                return model;
            case django_form_iface_1.SimpleFieldTypes.TEXTAREA:
                return new core_2.DynamicTextAreaModel({
                    id: id,
                    placeholder: label,
                    required: field_config.required,
                    disabled: field_config.read_only,
                    rows: 5,
                    validators: {
                        external_validator: {
                            name: external_validator.name,
                            args: { id: id, errors: this._external_errors }
                        },
                        maxLength: field_config.max_length,
                        minLength: field_config.min_length
                    },
                    errorMessages: {
                        external_error: '{{external_error}}'
                    },
                }, field_config.layout);
            case django_form_iface_1.SimpleFieldTypes.DATE:
                return new core_2.DynamicInputModel({
                    id: id,
                    placeholder: label,
                    inputType: core_2.DYNAMIC_FORM_CONTROL_INPUT_TYPE_DATE,
                    required: field_config.required,
                    disabled: field_config.read_only,
                    validators: {
                        external_validator: {
                            name: external_validator.name,
                            args: { id: id, errors: this._external_errors }
                        }
                    },
                    errorMessages: {
                        external_error: '{{external_error}}'
                    },
                }, field_config.layout);
            case django_form_iface_1.SimpleFieldTypes.INTEGER:
                var ifc = field_config;
                return new core_2.DynamicInputModel({
                    id: id,
                    placeholder: label,
                    inputType: core_2.DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER,
                    required: field_config.required,
                    disabled: field_config.read_only,
                    min: ifc.min_value,
                    max: ifc.max_value,
                    validators: {
                        external_validator: {
                            name: external_validator.name,
                            args: { id: id, errors: this._external_errors }
                        },
                        min: ifc.min_value,
                        max: ifc.max_value
                    },
                    errorMessages: {
                        external_error: '{{external_error}}',
                        min: "Value must be in range " + ifc.min_value + " - " + ifc.max_value,
                        max: "Value must be in range " + ifc.min_value + " - " + ifc.max_value
                    }
                }, field_config.layout);
            case django_form_iface_1.SimpleFieldTypes.FLOAT:
                var ffc = field_config;
                return new core_2.DynamicInputModel({
                    id: id,
                    placeholder: label,
                    inputType: core_2.DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER,
                    required: field_config.required,
                    disabled: field_config.read_only,
                    min: ffc.min_value,
                    max: ffc.max_value,
                    step: 0.00000001,
                    validators: {
                        external_validator: {
                            name: external_validator.name,
                            args: { id: id, errors: this._external_errors }
                        },
                        min: ffc.min_value,
                        max: ffc.max_value
                    },
                    errorMessages: {
                        external_error: '{{external_error}}',
                        min: "Value must be in range " + ffc.min_value + " - " + ffc.max_value,
                        max: "Value must be in range " + ffc.min_value + " - " + ffc.max_value
                    }
                }, field_config.layout);
            case django_form_iface_1.SimpleFieldTypes.BOOLEAN:
                return new core_2.DynamicCheckboxModel({
                    id: id,
                    label: label,
                    required: field_config.required,
                    disabled: field_config.read_only,
                    validators: {
                        external_validator: {
                            name: external_validator.name,
                            args: { id: id, errors: this._external_errors }
                        }
                    },
                    errorMessages: {
                        external_error: '{{external_error}}'
                    }
                }, field_config.layout);
            case django_form_iface_1.SimpleFieldTypes.RADIO:
                return new core_2.DynamicRadioGroupModel({
                    id: id,
                    label: label,
                    options: field_config.choices,
                    required: field_config.required,
                    disabled: field_config.read_only,
                    validators: {
                        external_validator: {
                            name: external_validator.name,
                            args: { id: id, errors: this._external_errors }
                        }
                    },
                    errorMessages: {
                        external_error: '{{external_error}}'
                    }
                }, field_config.layout);
            case django_form_iface_1.SimpleFieldTypes.SELECT:
                return new core_2.DynamicSelectModel({
                    id: id,
                    placeholder: label,
                    options: field_config.choices,
                    required: field_config.required,
                    disabled: field_config.read_only,
                    validators: {
                        external_validator: {
                            name: external_validator.name,
                            args: { id: id, errors: this._external_errors }
                        }
                    },
                    errorMessages: {
                        external_error: '{{external_error}}'
                    }
                }, field_config.layout);
            case django_form_iface_1.CompositeFieldTypes.FIELDSET:
                return new core_2.DynamicFormGroupModel({
                    id: 'generated_' + this.last_id++,
                    label: label,
                    group: this._generate_ui_control_array(field_config.controls)
                }, field_config.layout);
            default:
                throw new Error("No ui control model for " + type);
        }
    };
    DjangoFormContentComponent.prototype._update_initial_data = function () {
        var _this = this;
        console.log('updating initial data', this._initial_data, this.form_group);
        if (this._initial_data && this.form_group) {
            Object.keys(this.form_group.controls).forEach(function (name) {
                if (_this._initial_data) {
                    if (name in _this._initial_data) {
                        _this.form_group.controls[name].setValue(_this._initial_data[name]);
                    }
                }
            });
        }
    };
    Object.defineProperty(DjangoFormContentComponent.prototype, "valid", {
        get: function () {
            if (this.form_group) {
                return this.form_group.valid;
            }
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DjangoFormContentComponent.prototype, "value", {
        get: function () {
            if (this.form_group) {
                return this.form_group.value;
            }
            return true;
        },
        enumerable: true,
        configurable: true
    });
    DjangoFormContentComponent.prototype.on_submit_on_enter = function () {
        this.submit_on_enter.next(this.value);
    };
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], DjangoFormContentComponent.prototype, "submit_on_enter", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array),
        __metadata("design:paramtypes", [Array])
    ], DjangoFormContentComponent.prototype, "layout", null);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], DjangoFormContentComponent.prototype, "errors", null);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], DjangoFormContentComponent.prototype, "initial_data", null);
    DjangoFormContentComponent = __decorate([
        core_1.Component({
            selector: 'django-form-content',
            templateUrl: './django-form-content.component.html',
            styleUrls: ['./django-form-content.component.scss']
        }),
        __metadata("design:paramtypes", [core_2.DynamicFormService, http_1.HttpClient,
            error_service_1.ErrorService,
            core_1.ElementRef,
            core_1.ChangeDetectorRef])
    ], DjangoFormContentComponent);
    return DjangoFormContentComponent;
}());
exports.DjangoFormContentComponent = DjangoFormContentComponent;
function external_validator(conf) {
    // noinspection JSUnusedLocalSymbols
    return function (_control) {
        if (conf.id in conf.errors) {
            var ret = { external_error: { value: conf.errors[conf.id][0] } };
            delete conf.errors[conf.id];
            return ret;
        }
        else {
            return {};
        }
    };
}
exports.external_validator = external_validator;
var AutoCompleter = /** @class */ (function () {
    function AutoCompleter(http, errors, autocompletion_list, autocompletion_url, model) {
        this.http = http;
        this.errors = errors;
        this.autocompletion_list = autocompletion_list;
        this.autocompletion_url = autocompletion_url;
        this.model = model;
    }
    AutoCompleter.prototype.change = function (_widget, value, form_value) {
        var _this = this;
        var filtered_list;
        if (this.autocompletion_url) {
            this.http
                .post(this.autocompletion_url + '?query=' + encodeURIComponent(value), form_value)
                .catch(function (error) {
                return _this.errors.show_communication_error(error);
            })
                .subscribe(function (resp) {
                resp = resp || [];
                filtered_list = resp.map(function (x) { return x.label; });
                _this.model.list = filtered_list;
            });
        }
        else {
            if (this.autocompletion_list) {
                filtered_list = this.autocompletion_list.filter(function (x) { return x.indexOf(value) >= 0; });
                this.model.list = filtered_list;
            }
            else {
                this.model.list = [];
            }
        }
    };
    return AutoCompleter;
}());

//# sourceMappingURL=django-form-content.component.js.map
