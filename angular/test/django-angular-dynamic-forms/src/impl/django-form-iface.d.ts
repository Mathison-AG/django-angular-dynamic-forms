import { DynamicFormControlLayout } from '@ng-dynamic-forms/core';
export declare enum SimpleFieldTypes {
    STRING = "string",
    TEXTAREA = "textarea",
    DATE = "date",
    INTEGER = "integer",
    FLOAT = "float",
    BOOLEAN = "boolean",
    RADIO = "radio",
    SELECT = "select",
}
export declare enum CompositeFieldTypes {
    FIELDSET = "fieldset",
}
export declare type FieldTypes = SimpleFieldTypes | CompositeFieldTypes;
export interface FieldConfigBase {
    id?: string;
    label?: string;
    type: FieldTypes;
    required?: boolean;
    read_only?: boolean;
    layout?: DynamicFormControlLayout;
}
export interface StringFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.STRING;
    max_length?: number;
    min_length?: number;
    autocomplete_list?: string[];
    autocomplete_url?: string;
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
export declare type FieldConfig = StringFieldConfig | TextAreaFieldConfig | DateFieldConfig | IntegerFieldConfig | FloatFieldConfig | BooleanFieldConfig | RadioFieldConfig | SelectFieldConfig | FieldSetConfig;
export interface DjangoFormConfig {
    django_url?: string;
    form_title?: string;
    has_initial_data?: boolean;
    method?: string;
    initial_data?: any;
    layout?: FieldConfig[];
}
export interface DjangoDialogConfig {
    django_url?: string;
    config?: DjangoFormConfig;
    extra_form_data?: any;
    initial_data_transformation?: (initial_data: any) => any;
    config_transformation?: (config: DjangoFormConfig) => DjangoFormConfig;
    form_id?: string;
}
