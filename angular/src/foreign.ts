/**
 * This module provides interfaces for implementing dialogs for filling foreign key fields.
 */

import {InjectionToken, Type} from '@angular/core';
import {MatDialogRef} from '@angular/material';

/**
 * An interface that represents a result of foreign field lookup (i.e. the result of foreign key dialog)
 */
export interface ForeignFieldLookupResult {
    /**
     * The value from drf serializer formatted through the formatter
     */
    formatted_value: any;

    /**
     * The primary key of the value to be used for the foreign field.
     * Only primitive values are allowed, no composite keys.
     */
    key: string|number;
}

/**
 * The configuration of the lookup component
 */
export interface ForeignFieldLookupConfig {
    /**
     * handlebars formatter string that will be given the json of the foreign key target. Will be used by the caller
     * to create a text representation of the value. Provider of the lookup component might use it so that user
     * sees the same representation both in the lookup dialog and in the caller form.
     */
    formatter?: string;      // handlebars-style formatter string

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
     * initial value of the component
     */
    initialValue: ForeignFieldLookupResult[];

}

/**
 * A component that is used for field lookup (will be presented as an overlayed dialogue). Implement this interface
 * in a plain component and register the class of the component as ``FOREIGN_FIELD_LOOKUP_PROVIDER``. The component
 * will be loaded via MatDialog - inject the dialogRef and dialog data and use the data to set up the component
 * and its initial value.
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

export const FOREIGN_FIELD_LOOKUP_COMPONENT_PROVIDER = new InjectionToken('ForeignFieldLookup');
export const FOREIGN_FIELD_LOOKUP_FACTORY_PROVIDER = new InjectionToken('ForeignFieldLookupFactory');
