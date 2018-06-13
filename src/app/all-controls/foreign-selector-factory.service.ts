import {Injectable, Type} from '@angular/core';
import {ForeignFieldLookupFactory, ForeignFieldLookupComponent} from 'django-angular-dynamic-forms';
import {ForeignSelectorComponent} from './foreign-selector.component';
import {TagSelectorComponent} from './tag-selector.component';

@Injectable()
export class ForeignSelectorFactoryService implements ForeignFieldLookupFactory {

    constructor() {
    }

    public getComponent(lookupConfig: any): Type<ForeignFieldLookupComponent> {
        if (lookupConfig.id === 'foreign_key') {
            return ForeignSelectorComponent;
        }
        if (lookupConfig.id === 'tags') {
            return TagSelectorComponent;
        }
        return undefined;
    }
}
