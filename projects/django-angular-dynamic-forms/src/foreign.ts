/**
 * This module provides interfaces for implementing dialogs for filling foreign key fields.
 */

import { InjectionToken, Type } from "@angular/core";
import { MatDialogRef } from "@angular/material";

/**
 * An interface that represents a result of foreign field lookup (i.e. the result of foreign key dialog)
 */
export type ForeignFieldLookupResult = any;

/**
 * The configuration of the lookup component
 */
export interface ForeignFieldLookupConfig {
    /**
     * true if multiple values are allowed, false otherwise
     */
    multiple: boolean;

    /**
     * autocomplete url if set by the backend
     */
    autocompleteUrl?: string;
}

export interface ForeignFieldLookupComponentData {
    /**
     * The configuration of the component
     */
    config: ForeignFieldLookupConfig;

    /**
     * initial value of the component - an array of json objects
     */
    initialValue: ForeignFieldLookupResult[];
}

/**
 * A component that is used for field lookup (will be presented as an overlayed dialogue). Implement this interface
 * in a plain component and register the class of the component as ``FOREIGN_FIELD_LOOKUP_PROVIDER``. The component
 * will be loaded via MatDialog - inject the dialogRef and dialog data and use the data to set up the component
 * and its initial value.
 *
 * When closing, the component should return an array of ForeignFieldLookupResult - that is any objects
 * that have 'id' field.
 *
 * Example:
 *
 * @Component(...)
 * export class MyForeignFieldLookup implements ForeignFieldLookupComponent {
 *    constructor(public dialogRef: MatDialogRef<ForeignFieldLookupComponent>,
 *                 @Inject(MAT_DIALOG_DATA) public data: ForeignFieldLookupComponentData) {
 *   }
 * }
 *
 *
 * root module:
 *
 *   providers: [
 *       {
 *           provide: FOREIGN_FIELD_LOOKUP_PROVIDER,
 *           useValue: MyForeignFieldLookup
 *       }
 *   ]
 */
export interface ForeignFieldLookupComponent {
    dialogRef: MatDialogRef<ForeignFieldLookupComponent>;
}

/**
 * In case different foreign keys require different lookup dialogues, implement this interface and register it as a
 * ``FOREIGN_FIELD_LOOKUP_FACTORY_PROVIDER``
 */
export interface ForeignFieldLookupFactory {
    /**
     *
     * Return a component for a given lookup field. The configuration of the field comes from
     * Django's form serialization and usually looks like:
     *
     * {
     *     id: string;
     *     type='field';
     *     ... any other data that were specified on serializer's form_default attribute. See the demo for an
     *     almost real-world example.
     * }
     *
     * @param lookupConfig
     * @returns the class of the component that will be used to render selector
     */
    getComponent(lookupConfig: any): Type<ForeignFieldLookupComponent>;
}

/**
 * Django rest framework might serialize the foreign key in a several different ways. This editor expects
 * the serialized value be a json object with an 'id' field and any number of other fields of any type.
 *
 * To convert the object representation of the foreign key into a displayed text value, ForeignFieldFormatter is used.
 */
export interface ForeignFieldFormatter {
    /**
     * Receives a form field configuration and value as object and returns displayable string value
     *
     * @param config - form field configuration. Extendable, use 'form_defaults' on viewset
     *                                            to add information there
     * @param value         - object value of the foreign key
     * @returns     the formatted value
     */
    format(config: ForeignFieldLookupConfig, value: any): string;
}

export const FOREIGN_FIELD_LOOKUP_COMPONENT_PROVIDER = new InjectionToken(
    "ForeignFieldLookup"
);
export const FOREIGN_FIELD_LOOKUP_FACTORY_PROVIDER = new InjectionToken(
    "ForeignFieldLookupFactory"
);
export const FOREIGN_FIELD_FORMATTER_PROVIDER = new InjectionToken(
    "ForeignFieldFormatterProvider"
);
