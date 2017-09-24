import {NgModule} from '@angular/core';
import {DjangoFormComponent} from './django-form.component';
import {DynamicFormsCoreModule} from '@ng-dynamic-forms/core/src/core.module';
import {DynamicFormsMaterialUIModule} from '@ng-dynamic-forms/ui-material/src/dynamic-material-form-ui.module';
import {NG_VALIDATORS, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {external_validator, InternalDjangoFormComponent} from './impl/internal-django-form.component';
import {MdButtonModule, MdProgressBarModule, MdSnackBarModule} from '@angular/material';
import {MdButtonGroupModule} from '../material/button-group/button.group.module';

@NgModule({
    declarations: [
        DjangoFormComponent,
        InternalDjangoFormComponent
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
    ],
    providers: [
        {provide: NG_VALIDATORS, useValue: external_validator, multi: true}
    ],
    exports: [
        DjangoFormComponent
    ],
    entryComponents: [
        InternalDjangoFormComponent
    ]
})
export class DjangoFormModule {
}
