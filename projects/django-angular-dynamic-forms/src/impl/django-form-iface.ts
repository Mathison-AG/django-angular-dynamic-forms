import { DynamicFormControlLayout } from "@ng-dynamic-forms/core";

export enum SimpleFieldTypes {
    STRING = "string",
    TEXTAREA = "textarea",
    DATE = "date",
    INTEGER = "integer",
    FLOAT = "float",
    BOOLEAN = "boolean",
    RADIO = "radio",
    SELECT = "select",
    EMAIL = "email",
    FIELD = "field",
    FILE = "file",
}

export enum CompositeFieldTypes {
    FIELDSET = "fieldset",
    COLUMNS = "columns",
    GROUP = "group",
}

export type FieldTypes = SimpleFieldTypes | CompositeFieldTypes;

export interface FieldConfigBase {
    id?: string;
    label?: string;
    type: FieldTypes;
    required?: boolean;
    readOnly?: boolean;
    layout?: DynamicFormControlLayout;
}

export interface StringFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.STRING;
    maxLength?: number;
    minLength?: number;
    autocompleteList?: string[];
    autocompleteUrl?: string;
}

export interface EmailFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.EMAIL;
    maxLength?: number;
    minLength?: number;
    autocompleteList?: string[];
    autocompleteUrl?: string;
}

export interface TextAreaFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.TEXTAREA;
    maxLength?: number;
    minLength?: number;
}

export interface DateFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.DATE;
}

export interface FileFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.FILE;
}

export interface BooleanFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.BOOLEAN;
}

export interface IntegerFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.INTEGER;
    maxValue?: number;
    minValue?: number;
}

export interface FloatFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.FLOAT;
    maxValue?: number;
    minValue?: number;
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

export interface ForeignFieldConfig extends FieldConfigBase {
    type: SimpleFieldTypes.FIELD;
    formatter: string;
    multiple?: boolean;
}

export interface FieldSetConfig extends FieldConfigBase {
    type: CompositeFieldTypes.FIELDSET;
    controls: FieldConfig[];
}

export interface ColumnsFieldConfig extends FieldConfigBase {
    type: CompositeFieldTypes.COLUMNS;
    controls: FieldConfig[];
}

export interface GroupFieldConfig extends FieldConfigBase {
    type: CompositeFieldTypes.GROUP;
    controls: FieldConfig[];
}

export type FieldConfig =
    | StringFieldConfig
    | TextAreaFieldConfig
    | DateFieldConfig
    | IntegerFieldConfig
    | FloatFieldConfig
    | BooleanFieldConfig
    | RadioFieldConfig
    | SelectFieldConfig
    | FieldSetConfig
    | EmailFieldConfig
    | ColumnsFieldConfig
    | GroupFieldConfig
    | ForeignFieldConfig
    | FileFieldConfig;

export interface DjangoFormConfig {
    // url of the django rest framework endpoint
    djangoUrl?: string;

    // title of the form (in the target language, will not get translated)
    formTitle?: string;

    // true if should fetch the initial data via get to the djangoUrl
    hasInitialData?: boolean;

    // either "post" or "patch"
    method?: string;

    // the initial data, might not be filled
    initialData?: any;

    // layout of the form
    layout?: FieldConfig[];
}

export interface DjangoDialogConfig {
    // django url, form initial data will downloaded and saved to this url
    djangoUrl?: string;

    // config in case djangoUrl is not set
    config?: DjangoFormConfig;

    // extra data that will be sent in GET/POST requests to django
    extraFormData?: any;

    // transformation that is performed on the initial data before they are passed to generated form
    initialDataTransformation?: (initialData: any) => any;

    // transformation to the form configuration before the form is generated
    configTransformation?: (config: DjangoFormConfig) => DjangoFormConfig;

    // form name in case there are multiple forms defined on a viewset
    formId?: string;
}
