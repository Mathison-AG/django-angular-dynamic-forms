import {
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    TemplateRef,
    Type,
} from "@angular/core";

import {
    AbstractControl,
    FormArray,
    FormControlDirective,
    FormControlName,
    FormGroup,
    ValidatorFn,
} from "@angular/forms";

import {
    DYNAMIC_FORM_CONTROL_INPUT_TYPE_DATE,
    DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER,
    DynamicCheckboxModel,
    DynamicFormControlLayout,
    DynamicFormControlModel,
    DynamicFormGroupModel,
    DynamicFormService,
    DynamicInputModel,
    DynamicRadioGroupModel,
    DynamicSelectModel,
    DynamicTextAreaModel,
} from "@ng-dynamic-forms/core";

import { HttpClient } from "@angular/common/http";

import { ErrorService } from "./error-service";
import {
    ColumnsFieldConfig,
    CompositeFieldTypes,
    EmailFieldConfig,
    FieldConfig,
    FieldSetConfig,
    FloatFieldConfig,
    ForeignFieldConfig,
    IntegerFieldConfig,
    RadioFieldConfig,
    SelectFieldConfig,
    SimpleFieldTypes,
    StringFieldConfig,
    TextAreaFieldConfig,
} from "./django-form-iface";
import { DynamicFormControlLayoutConfig } from "@ng-dynamic-forms/core/src/model/misc/dynamic-form-control-layout.model";
import {
    FOREIGN_FIELD_FORMATTER_PROVIDER,
    FOREIGN_FIELD_LOOKUP_COMPONENT_PROVIDER,
    FOREIGN_FIELD_LOOKUP_FACTORY_PROVIDER,
    ForeignFieldFormatter,
    ForeignFieldLookupComponent,
    ForeignFieldLookupConfig,
    ForeignFieldLookupFactory,
    ForeignFieldLookupResult,
} from "../foreign";
import { MatDialog } from "@angular/material";
import { catchError } from "rxjs/operators";
import { Subscription } from "rxjs";

class AutoCompleter {
    constructor(
        private http: HttpClient,
        private errors: ErrorService,
        private autocompletionList: any[] | undefined,
        private autocompletionUrl: string | undefined,
        public model: any
    ) {}

    public change(
        _widget: any,
        value: string,
        formValue: string,
        check: ChangeDetectorRef
    ) {
        let filteredList;
        if (this.autocompletionUrl) {
            this.http
                .post<any[]>(
                    this.autocompletionUrl +
                        "?query=" +
                        encodeURIComponent(value),
                    formValue
                )
                .pipe(
                    catchError((error) => {
                        return this.errors.showCommunicationError(error);
                    })
                )
                .subscribe((resp) => {
                    resp = resp || [];
                    filteredList = resp.map((x) => x.label);
                    this.model.list = filteredList;
                    check.markForCheck();
                });
        } else {
            if (this.autocompletionList) {
                filteredList = this.autocompletionList.filter(
                    (x) => x.indexOf(value) >= 0
                );
                this.model.list = filteredList;
                check.markForCheck();
            } else {
                this.model.list = [];
                check.markForCheck();
            }
        }
    }
}

/**
 * Form component targeted on django rest framework
 */
@Component({
    selector: "django-form-content",
    templateUrl: "./django-form-content.component.html",
    styleUrls: ["./django-form-content.component.scss"],
})
export class DjangoFormContentComponent implements OnInit, OnDestroy {
    public formModel: DynamicFormControlModel[] = [];
    public formGroup: FormGroup;

    /**
     * Returns submitted form data on enter
     *
     */
    @Output()
    public submitOnEnter = new EventEmitter();

    @ContentChild(TemplateRef)
    private templateRef: TemplateRef<any>;

    private autocompleters: AutoCompleter[] = [];
    private lastId = 0;

    private _externalErrors: { [s: string]: any } = {};
    private _initialData: any = null;

    private foreigns: any[] = [];
    private foreignDefinitions: { [s: string]: any } = {};

    @Output()
    valueChanged = new EventEmitter<any>();
    valueChangedSubscription: Subscription;

    @Input()
    public set layout(_layout: FieldConfig[]) {
        if (_layout) {
            this.formModel = [];
            this.autocompleters = [];
            this.foreignDefinitions = {};
            this.formModel = this._generateUIControlArray(_layout);

            if (this.formGroup) {
                this._unbindForeignKey();
                this._initializeGroup();
            }

            this.check.detectChanges();
        }
    }

    @Input()
    public set errors(_errors: any) {
        if (_errors) {
            Object.assign(this._externalErrors, _errors);
            for (const errorName of Object.getOwnPropertyNames(_errors)) {
                const errorValues = _errors[errorName];
                const errorModel = this.formService.findById(
                    errorName,
                    this.formModel
                ) as DynamicInputModel;
                // TODO: hack - do not know how to set up the validation message
                if (errorModel) {
                    (errorModel as any).externalError = errorValues[0];
                }
                // TODO: change this to support arrays
                const errorControl = this.getControlByName(errorName);
                if (errorControl) {
                    errorControl.markAsDirty();
                    errorControl.markAsTouched();
                    errorControl.setValue(errorControl.value);
                } else {
                    console.log(
                        `Can not set error of ${errorName} within`,
                        this.formGroup,
                        errorModel
                    );
                }
            }
        } else {
            for (const prop of Object.getOwnPropertyNames(
                this._externalErrors
            )) {
                delete this._externalErrors[prop];
            }
        }
    }

    @Input()
    public set initialData(data: any) {
        this._initialData = data;
        this._updateInitialData();
    }

    constructor(
        private formService: DynamicFormService,
        private httpClient: HttpClient,
        private errorService: ErrorService,
        private currentElement: ElementRef,
        private check: ChangeDetectorRef,
        private zone: NgZone,
        @Optional()
        @Inject(FOREIGN_FIELD_LOOKUP_COMPONENT_PROVIDER)
        private foreignFieldLookupComponent: Type<ForeignFieldLookupComponent>,
        @Optional()
        @Inject(FOREIGN_FIELD_LOOKUP_FACTORY_PROVIDER)
        private foreignFieldLookupFactory: ForeignFieldLookupFactory,
        @Optional()
        @Inject(FOREIGN_FIELD_FORMATTER_PROVIDER)
        private foreignFieldFormatter: ForeignFieldFormatter,
        private dialog: MatDialog
    ) {}

    public ngOnInit() {
        // create an empty form group, will be filled later
        if (!this.formGroup) {
            this._initializeGroup();
        }
        this._triggerValidation();
        this.check.detectChanges();
    }

    public ngOnDestroy() {
        this._unbindForeignKey();
        if (this.valueChangedSubscription) {
            this.valueChangedSubscription.unsubscribe();
        }
    }

    public get valid() {
        if (this.formGroup) {
            return this.formGroup.valid;
        }
        return true;
    }

    public get value() {
        if (this.formGroup) {
            return this.formGroup.value;
        }
        return true;
    }

    public _onSubmitOnEnter() {
        this.submitOnEnter.next(this.value);
    }

    private _initializeGroup() {
        this.formGroup = this.formService.createFormGroup(this.formModel);
        this._bindAutocomplete();
        this._bindForeignKey();
        this._updateInitialData();
        if (this.valueChangedSubscription) {
            this.valueChangedSubscription.unsubscribe();
        }
        this.valueChangedSubscription = this.formGroup.valueChanges.subscribe(
            (value) => {
                function _flatten(o) {
                    if (o === undefined || o === null) {
                        return [];
                    }
                    return [].concat(
                        ...Object.keys(o).map((k) =>
                            typeof o[k] === "object"
                                ? _flatten(o[k])
                                : { [k]: o[k] }
                        )
                    );
                }
                value = Object.assign({}, ..._flatten(value));
                this.valueChanged.emit(value);
            }
        );
    }

    private _bindAutocomplete() {
        for (const autocompleter of this.autocompleters) {
            const widget = this.formGroup.get(
                this.formService.getPath(autocompleter.model)
            );
            if (widget) {
                widget.valueChanges.subscribe((value) => {
                    autocompleter.change(widget, value, this.value, this.check);
                });
            }
        }
    }

    private _bindForeignKey() {
        setTimeout(() => {
            // do it after angular tick when components are ready
            // TODO: hack that needs to be removed when ng-dynamic-forms implement custom dynamic components
            // - see https://github.com/udos86/ng-dynamic-forms/issues/660
            this.iterateControls((name, control) => {
                const valueAccessor = (control as any).valueAccessor;
                if (valueAccessor) {
                    if (valueAccessor.controlType === "mat-select") {
                        const formModel = this.formService.findById(
                            name,
                            this.formModel
                        );
                        if (!formModel) {
                            return;
                        }
                        if (!(formModel instanceof DynamicSelectModel)) {
                            return;
                        }
                        if (!this.foreignDefinitions[name]) {
                            return;
                        }
                        this._installForeignHandler(
                            name,
                            control,
                            valueAccessor,
                            formModel
                        );
                    }
                }
            });
        });
    }

    private _installForeignHandler(
        name: string,
        control: AbstractControl,
        valueAccessor: any,
        formModel: DynamicSelectModel<string>
    ) {
        const def = this.foreignDefinitions[name];
        if (this.foreigns.indexOf(control) < 0) {
            this.foreigns.push(control);
            const native = valueAccessor._elementRef.nativeElement;
            // bind mousedown on the wrapper so that label is also active
            native.parentElement.addEventListener("mousedown", (event) => {
                this._runForeignKeySelection(name, def, formModel);
            });
        }
    }

    private _runForeignKeySelection(
        name: string,
        def: any,
        formModel: DynamicSelectModel<string>
    ) {
        this.zone.run(() => {
            let component: Type<ForeignFieldLookupComponent>;
            if (this.foreignFieldLookupFactory) {
                component = this.foreignFieldLookupFactory.getComponent(def);
            }
            if (!component && this.foreignFieldLookupComponent) {
                component = this.foreignFieldLookupComponent;
            }
            if (!component) {
                this.errorService.showError(
                    "Please define provider for field lookup, see the demo or " +
                        "foreign.ts for details"
                );
                return;
            }

            const value = (
                Array.isArray(formModel.value)
                    ? formModel.value
                    : [formModel.value]
            ) as string[];
            const dialogRef = this.dialog.open(component, {
                maxHeight: "90vh",
                height: "auto",
                maxWidth: "90vw",
                width: "auto",
                data: {
                    initialValue: value.filter((x) => !!x),
                    config: def,
                },
            });
            dialogRef
                .afterClosed()
                .subscribe((result: ForeignFieldLookupResult[] | undefined) => {
                    this._setForeignSelectValue(def, formModel, result);
                });
        });
    }

    private _setForeignSelectValue(
        def: ForeignFieldLookupConfig,
        formModel: DynamicSelectModel<string>,
        result: ForeignFieldLookupResult[] | undefined
    ) {
        result = this._transformForeignValue(def, result);
        if (result === undefined) {
            // do nothing for undefined result
            return;
        }
        if (!result.length) {
            // deselect value
            formModel.options = [];
            // formModel.select();
            return;
        }
        formModel.options = result.map((r: any) => ({
            label: r.label,
            value: r.value,
        }));
        formModel.select(...result.map((_, index) => index));
    }

    private _unbindForeignKey() {
        this.foreigns.forEach((control) => {
            const valueAccessor = (control as any).valueAccessor;
            valueAccessor._elementRef.nativeElement.removeAllListeners();
        });
        this.foreigns = [];
    }

    private _triggerValidation() {
        if (this.formGroup) {
            Object.keys(this.formGroup.controls).forEach((field) => {
                const control = this.formGroup.get(field);
                if (control) {
                    control.markAsTouched({ onlySelf: true });
                }
            });
        }
    }

    private _generateUIControlArray(
        configs: FieldConfig[]
    ): DynamicFormControlModel[] {
        const model: DynamicFormControlModel[] = [];
        for (const config of configs) {
            const _control = this._generateUIControl(config);
            if (_control) {
                model.push(_control);
            }
        }
        return model;
    }

    private _generateUIControl(
        fieldConfig: FieldConfig
    ): DynamicFormControlModel {
        const id = fieldConfig.id || "___undefined__id__at__config";
        const label = fieldConfig.label || "";
        const type = fieldConfig.type || SimpleFieldTypes.STRING;

        const extraLayout: DynamicFormControlLayout = {
            grid: {
                host: `dadf-field-id-${id} dadf-field-type-${type}`,
            },
        };

        switch (type) {
            case SimpleFieldTypes.STRING: {
                const sfc = fieldConfig as StringFieldConfig;
                const model = new DynamicInputModel(
                    {
                        id,
                        placeholder: label,
                        required: fieldConfig.required,
                        disabled: fieldConfig.readOnly,
                        validators: {
                            externalValidator: {
                                name: externalValidator.name,
                                args: { id, errors: this._externalErrors },
                            },
                            maxLength: sfc.maxLength,
                            minLength: sfc.minLength,
                        },
                        errorMessages: {
                            externalError: "{{externalError}}",
                        },
                        list: sfc.autocompleteList,
                    },
                    mergeLayouts(fieldConfig.layout, extraLayout)
                );
                if (sfc.autocompleteList || sfc.autocompleteUrl) {
                    this.autocompleters.push(
                        new AutoCompleter(
                            this.httpClient,
                            this.errorService,
                            sfc.autocompleteList,
                            sfc.autocompleteUrl,
                            model
                        )
                    );
                }
                return model;
            }
            case SimpleFieldTypes.EMAIL: {
                const sfc = fieldConfig as EmailFieldConfig;
                const model = new DynamicInputModel(
                    {
                        id,
                        placeholder: label,
                        required: fieldConfig.required,
                        disabled: fieldConfig.readOnly,
                        inputType: "email",
                        validators: {
                            externalValidator: {
                                name: externalValidator.name,
                                args: { id, errors: this._externalErrors },
                            },
                            maxLength: sfc.maxLength,
                            minLength: sfc.minLength,
                        },
                        errorMessages: {
                            externalError: "{{externalError}}",
                        },
                        list: sfc.autocompleteList,
                    },
                    mergeLayouts(fieldConfig.layout, extraLayout)
                );
                if (sfc.autocompleteList || sfc.autocompleteUrl) {
                    this.autocompleters.push(
                        new AutoCompleter(
                            this.httpClient,
                            this.errorService,
                            sfc.autocompleteList,
                            sfc.autocompleteUrl,
                            model
                        )
                    );
                }
                return model;
            }
            case SimpleFieldTypes.TEXTAREA:
                return new DynamicTextAreaModel(
                    {
                        id,
                        placeholder: label,
                        required: fieldConfig.required,
                        disabled: fieldConfig.readOnly,
                        rows: 5,
                        validators: {
                            externalValidator: {
                                name: externalValidator.name,
                                args: { id, errors: this._externalErrors },
                            },
                            maxLength: (fieldConfig as TextAreaFieldConfig)
                                .maxLength,
                            minLength: (fieldConfig as TextAreaFieldConfig)
                                .minLength,
                        },
                        errorMessages: {
                            externalError: "{{externalError}}",
                        },
                    },
                    mergeLayouts(fieldConfig.layout, extraLayout)
                );
            case SimpleFieldTypes.DATE:
                return new DynamicInputModel(
                    {
                        id,
                        placeholder: label,
                        inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_DATE,
                        required: fieldConfig.required,
                        disabled: fieldConfig.readOnly,
                        validators: {
                            externalValidator: {
                                name: externalValidator.name,
                                args: { id, errors: this._externalErrors },
                            },
                        },
                        errorMessages: {
                            externalError: "{{externalError}}",
                        },
                    },
                    mergeLayouts(fieldConfig.layout, extraLayout)
                );
            case SimpleFieldTypes.INTEGER:
                const ifc = fieldConfig as IntegerFieldConfig;
                return new DynamicInputModel(
                    {
                        id,
                        placeholder: label,
                        inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER,
                        required: fieldConfig.required,
                        disabled: fieldConfig.readOnly,
                        min: ifc.minValue,
                        max: ifc.maxValue,
                        validators: {
                            externalValidator: {
                                name: externalValidator.name,
                                args: { id, errors: this._externalErrors },
                            },
                            min: ifc.minValue,
                            max: ifc.maxValue,
                        },
                        errorMessages: {
                            externalError: "{{externalError}}",
                            min: `Value must be in range ${ifc.minValue} - ${ifc.maxValue}`,
                            max: `Value must be in range ${ifc.minValue} - ${ifc.maxValue}`,
                        },
                    },
                    mergeLayouts(fieldConfig.layout, extraLayout)
                );
            case SimpleFieldTypes.FLOAT:
                const ffc = fieldConfig as FloatFieldConfig;
                return new DynamicInputModel(
                    {
                        id,
                        placeholder: label,
                        inputType: DYNAMIC_FORM_CONTROL_INPUT_TYPE_NUMBER,
                        required: fieldConfig.required,
                        disabled: fieldConfig.readOnly,
                        min: ffc.minValue,
                        max: ffc.maxValue,
                        step: 0.00000001,
                        validators: {
                            externalValidator: {
                                name: externalValidator.name,
                                args: { id, errors: this._externalErrors },
                            },
                            min: ffc.minValue,
                            max: ffc.maxValue,
                        },
                        errorMessages: {
                            externalError: "{{externalError}}",
                            min: `Value must be in range ${ffc.minValue} - ${ffc.maxValue}`,
                            max: `Value must be in range ${ffc.minValue} - ${ffc.maxValue}`,
                        },
                    },
                    mergeLayouts(fieldConfig.layout, extraLayout)
                );
            case SimpleFieldTypes.BOOLEAN:
                return new DynamicCheckboxModel(
                    {
                        id,
                        label,
                        required: fieldConfig.required,
                        disabled: fieldConfig.readOnly,
                        validators: {
                            externalValidator: {
                                name: externalValidator.name,
                                args: { id, errors: this._externalErrors },
                            },
                        },
                        errorMessages: {
                            externalError: "{{externalError}}",
                        },
                    },
                    mergeLayouts(fieldConfig.layout, extraLayout)
                );
            case SimpleFieldTypes.RADIO:
                return new DynamicRadioGroupModel(
                    {
                        id,
                        label,
                        options: (fieldConfig as RadioFieldConfig).choices,
                        required: fieldConfig.required,
                        disabled: fieldConfig.readOnly,
                        validators: {
                            externalValidator: {
                                name: externalValidator.name,
                                args: { id, errors: this._externalErrors },
                            },
                        },
                        errorMessages: {
                            externalError: "{{externalError}}",
                        },
                    },
                    mergeLayouts(fieldConfig.layout, extraLayout)
                );
            case SimpleFieldTypes.SELECT:
                return new DynamicSelectModel(
                    {
                        id,
                        placeholder: label,
                        options: (fieldConfig as SelectFieldConfig).choices,
                        required: fieldConfig.required,
                        disabled: fieldConfig.readOnly,
                        validators: {
                            externalValidator: {
                                name: externalValidator.name,
                                args: { id, errors: this._externalErrors },
                            },
                        },
                        errorMessages: {
                            externalError: "{{externalError}}",
                        },
                    },
                    mergeLayouts(fieldConfig.layout, extraLayout)
                );
            case SimpleFieldTypes.FIELD:
                this.foreignDefinitions[id] = fieldConfig;
                return new DynamicSelectModel(
                    {
                        id,
                        placeholder: label,
                        // options: (fieldConfig as SelectFieldConfig).choices,
                        required: fieldConfig.required,
                        disabled: fieldConfig.readOnly,
                        multiple:
                            (fieldConfig as ForeignFieldConfig).multiple ||
                            false,
                        validators: {
                            externalValidator: {
                                name: externalValidator.name,
                                args: { id, errors: this._externalErrors },
                            },
                        },
                        errorMessages: {
                            externalError: "{{externalError}}",
                        },
                    },
                    mergeLayouts(fieldConfig.layout, extraLayout)
                );
            case CompositeFieldTypes.FIELDSET: {
                const fieldsetLayout = mergeLayouts(fieldConfig.layout, {
                    grid: {
                        label: "dadf-fieldset",
                    },
                });
                return new DynamicFormGroupModel(
                    {
                        id: "generated_" + this.lastId++,
                        label,
                        group: this._generateUIControlArray(
                            (fieldConfig as FieldSetConfig).controls
                        ),
                    },
                    mergeLayouts(fieldsetLayout, extraLayout)
                );
            }
            case CompositeFieldTypes.GROUP: {
                const groupLayout = mergeLayouts(fieldConfig.layout, {
                    grid: {
                        label: "group",
                    },
                });
                return new DynamicFormGroupModel(
                    {
                        id: "generated_" + this.lastId++,
                        group: this._generateUIControlArray(
                            (fieldConfig as FieldSetConfig).controls
                        ),
                    },
                    mergeLayouts(groupLayout, extraLayout)
                );
            }
            case CompositeFieldTypes.COLUMNS: {
                const csf = fieldConfig as ColumnsFieldConfig;
                const model: DynamicFormControlModel[] = [];
                for (const config of csf.controls) {
                    const _mergedLayout: DynamicFormControlLayout =
                        mergeLayouts(config.layout, {
                            grid: {
                                host: `dadf-column-${csf.controls.length}`,
                            },
                        });

                    const configWithLayout: FieldConfig = {
                        ...config,
                        layout: _mergedLayout,
                    } as FieldConfig; // TODO: why do we need this typecast ?

                    const _control = this._generateUIControl(configWithLayout);
                    if (_control) {
                        model.push(_control);
                    }
                }

                return new DynamicFormGroupModel(
                    {
                        id: "generated_" + this.lastId++,
                        group: model,
                    },
                    mergeLayouts(
                        mergeLayouts(fieldConfig.layout, {
                            grid: {
                                control: `dadf-columns dadf-columns-${csf.controls.length}`,
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
                        }),
                        extraLayout
                    )
                );
            }
            default:
                throw new Error(`No ui control model for ${type}`);
        }
    }

    private _updateInitialData() {
        if (this._initialData && this.formGroup) {
            this.iterateControls((name, control) => {
                if (name in this._initialData) {
                    const initial = this._initialData[name];
                    if (!initial) {
                        return;
                    }
                    if (name in this.foreignDefinitions) {
                        const def = this.foreignDefinitions[name];
                        this._setForeignSelectValue(
                            def,
                            this.formService.findById(
                                name,
                                this.formModel
                            ) as DynamicSelectModel<string>,
                            initial
                        );
                    } else {
                        control.setValue(initial);
                    }
                }
            });
        }
    }

    private _transformForeignValue(
        def: ForeignFieldLookupConfig,
        initial: any
    ): Array<{ label: string; value: any }> | undefined {
        if (initial === undefined) {
            return undefined;
        }
        if (!Array.isArray(initial)) {
            initial = [initial];
        }
        return initial.map((val) => {
            let formattedValue;
            if (this.foreignFieldFormatter) {
                formattedValue = this.foreignFieldFormatter.format(def, val);
            } else {
                formattedValue = `${val.id} - please register FOREIGN_FIELD_FORMATTER_PROVIDER`;
            }
            return {
                value: val,
                label: formattedValue,
            };
        });
    }

    private getControlByName(name: string): AbstractControl | undefined {
        function getControl(
            control: AbstractControl,
            controlName: string
        ): AbstractControl | undefined {
            let ret: AbstractControl | undefined;
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
                console.error("Arrays are not yet supported !");
            }
        }

        return getControl(this.formGroup, name);
    }

    private iterateControls(
        visitor: (name: string, control: AbstractControl) => void
    ) {
        function iter(name: string, control: AbstractControl): void {
            visitor(name, control);
            if (control instanceof FormGroup) {
                const formGroup = control as FormGroup;
                for (const childName in formGroup.controls) {
                    if (formGroup.controls.hasOwnProperty(childName)) {
                        const childControl = formGroup.controls[childName];
                        iter(childName, childControl);
                    }
                }
            }
            if (control instanceof FormArray) {
                console.error("Arrays are not yet supported !");
            }
        }

        return iter("---root---", this.formGroup);
    }
}

export function externalValidator(conf: {
    id: string;
    errors: any;
}): ValidatorFn {
    // noinspection JSUnusedLocalSymbols
    return (_control: AbstractControl): { [key: string]: any } => {
        if (conf.id in conf.errors) {
            const ret = { externalError: { value: conf.errors[conf.id][0] } };
            delete conf.errors[conf.id];
            return ret;
        } else {
            return {};
        }
    };
}

function mergeLayouts(
    layout1OrUndefined: DynamicFormControlLayout | undefined,
    layout2OrUndefined: DynamicFormControlLayout | undefined
): DynamicFormControlLayout | undefined {
    if (layout1OrUndefined === undefined) {
        return layout2OrUndefined;
    }
    if (layout2OrUndefined === undefined) {
        return layout1OrUndefined;
    }

    function mergeClasses(
        clz1OrUndefined: DynamicFormControlLayoutConfig | undefined,
        clz2OrUndefined: DynamicFormControlLayoutConfig | undefined
    ) {
        if (clz1OrUndefined === undefined) {
            return clz2OrUndefined;
        }
        if (clz2OrUndefined === undefined) {
            return clz1OrUndefined;
        }

        const clz1 = clz1OrUndefined as DynamicFormControlLayoutConfig;
        const clz2 = clz2OrUndefined as DynamicFormControlLayoutConfig;

        const classesRet: DynamicFormControlLayoutConfig = { ...clz2 };

        for (const arg in clz1) {
            if (classesRet[arg]) {
                classesRet[arg] = `${classesRet[arg]} ${clz1[arg]}`;
            } else {
                classesRet[arg] = clz1[arg];
            }
        }
        return classesRet;
    }

    const layout1 = layout1OrUndefined as DynamicFormControlLayout;
    const layout2 = layout2OrUndefined as DynamicFormControlLayout;

    const ret = {
        ...layout2,
        ...layout1,
    };
    const grid = mergeClasses(layout1.grid, layout2.grid);
    const element = mergeClasses(layout1.element, layout2.element);
    if (grid) {
        ret.grid = grid;
    }
    if (element) {
        ret.element = element;
    }
    return ret;
}

/**
 *
 * TODO: NASTY HACK TO ADD VALUE ACCESSOR ON THE COMPONENT TO ADD EVENT TO SELECTs
 *
 */
const originFormControlNgOnChanges = FormControlDirective.prototype.ngOnChanges;
FormControlDirective.prototype.ngOnChanges = function () {
    if (this.valueAccessor && this.valueAccessor._element) {
        this.form.nativeElement = this.valueAccessor._element.nativeElement;
    }
    return originFormControlNgOnChanges.apply(this, arguments);
};

const originFormControlNameNgOnChanges = FormControlName.prototype.ngOnChanges;
FormControlName.prototype.ngOnChanges = function () {
    const result = originFormControlNameNgOnChanges.apply(this, arguments);
    this.control.valueAccessor = this.valueAccessor;
    return result;
};
