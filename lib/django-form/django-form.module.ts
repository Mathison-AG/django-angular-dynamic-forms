import {NgModule} from '@angular/core';
import {DynamicFormsCoreModule} from '@ng-dynamic-forms/core/src/core.module';
import {DynamicFormsMaterialUIModule} from '@ng-dynamic-forms/ui-material/src/dynamic-material-form-ui.module';
import {NG_VALIDATORS, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {InPageDjangoFormComponent} from './impl/inpage-django-form.component';
import {MdButtonModule, MdDialogModule, MdProgressBarModule, MdSnackBarModule} from '@angular/material';
import {MdButtonGroupModule} from '../material/button-group/button.group.module';
import {DjangoFormContentComponent, external_validator} from './impl/django-form-content.component';
import {DialogDjangoFormComponent} from './impl/dialog-django-form.component';

@NgModule({
    declarations: [
        InPageDjangoFormComponent,
        DjangoFormContentComponent,
        DialogDjangoFormComponent,
    ],
    imports: [
        CommonModule,
        DynamicFormsCoreModule.forRoot(),
        DynamicFormsMaterialUIModule,
        ReactiveFormsModule,
        MdProgressBarModule,
        MdButtonModule,
        MdButtonGroupModule,
        MdSnackBarModule,
        MdDialogModule
    ],
    providers: [
        {provide: NG_VALIDATORS, useValue: external_validator, multi: true}
    ],
    exports: [
        InPageDjangoFormComponent,
        DialogDjangoFormComponent,
    ],
    entryComponents: [
        InPageDjangoFormComponent,
        DialogDjangoFormComponent,
    ]
})
export class DjangoFormModule {
}
