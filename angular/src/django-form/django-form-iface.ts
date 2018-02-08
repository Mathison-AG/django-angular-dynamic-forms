import {DynamicFormControlLayout} from '@ng-dynamic-forms/core';

export enum SimpleFieldTypes {
    STRING = 'string',
    TEXTAREA = 'textarea',
    DATE = 'date',
    INTEGER = 'integer',
    FLOAT = 'float',
    BOOLEAN = 'boolean',
    RADIO = 'radio',
    SELECT = 'select'
}

export enum CompositeFieldTypes {
    FIELDSET = 'fieldset',
}

export type FieldTypes = SimpleFieldTypes | CompositeFieldTypes;

export interface FieldConfigBase {
    id?: string;
    label?: string;
    type: FieldTypes;
    required?: boolean;
    read_only?: boolean;
    layout?: DynamicFormControlLayout
}

export interface StringFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.STRING;
    max_length?: number;
    min_length?: number;
    autocomplete_list? : string[];
    autocomplete_url? : string;
}

export interface TextAreaFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.TEXTAREA;
    max_length?: number;
    min_length?: number;
}

export interface DateFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.DATE;
}

export interface BooleanFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.BOOLEAN;
}

export interface IntegerFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.INTEGER;
    max_value?: number;
    min_value?: number;
}

export interface FloatFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.FLOAT;
    max_value?: number;
    min_value?: number;
}

export interface FieldChoice {
    label: string;
    value: string;
}

export interface RadioFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.RADIO;
    choices: FieldChoice[];
}

export interface SelectFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.SELECT;
    choices: FieldChoice[];
}

export interface FieldSetConfig extends FieldConfigBase {
    type: CompositeFieldTypes.FIELDSET;
    controls: FieldConfig[];
}

export type FieldConfig = StringFieldConfig | TextAreaFieldConfig | DateFieldConfig |
    IntegerFieldConfig | FloatFieldConfig | BooleanFieldConfig | RadioFieldConfig | SelectFieldConfig | FieldSetConfig;

export interface DjangoFormConfig {
    // url of the django rest framework endpoint
    django_url?: string;

    // title of the form (in the target language, will not get translated)
    form_title?: string;

    // true if should fetch the initial data via get to the django_url
    has_initial_data?: boolean;

    // either "post" or "patch"
    method?: string;

    // the initial data, might not be filled
    initial_data?: any;

    // layout of the form
    layout?: FieldConfig[];
}


export interface DjangoDialogConfig {

    // django url, form will be downloaded from the url
    django_url? : string;

    // config in case django_url is not set
    config? : DjangoFormConfig;

    // extra data that will be sent in GET/POST requests to django
    extra_form_data?: any;

    // transformation that is performed on the initial data before they are passed to generated form
    initial_data_transformation?: (any) => any;

    // transformation to the form configuration before the form is generated
    config_transformation?: (DjangoFormConfig) => DjangoFormConfig;

    // form name in case there are multiple forms defined on a viewset
    form_id?: string;

}
