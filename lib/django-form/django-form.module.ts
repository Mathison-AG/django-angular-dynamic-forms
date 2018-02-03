import {NgModule} from '@angular/core';
import {DynamicFormsCoreModule} from '@ng-dynamic-forms/core';
import {DynamicFormsMaterialUIModule} from '@ng-dynamic-forms/ui-material';
import {NG_VALIDATORS, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {InPageDjangoFormComponent} from './impl/inpage-django-form.component';
import {MatButtonModule, MatDialogModule, MatProgressBarModule, MatSnackBarModule} from '@angular/material';
import {DjangoFormContentComponent, external_validator} from './impl/django-form-content.component';
import {DialogDjangoFormComponent} from './impl/dialog-django-form.component';
import {DjangoFormBaseComponent} from './impl/django-form-base.component';
import {AddHtmlEditorsDirective} from './impl/textarea-html-editor';
import {ClearableInputDirective} from '@webui/django-form/impl/clearable-input-directive';
import {GoodiesModule} from '@webui/ui/layout/goodies/goodies.module';

@NgModule({
    declarations: [InPageDjangoFormComponent, DjangoFormContentComponent,
        DialogDjangoFormComponent, DjangoFormBaseComponent,
        AddHtmlEditorsDirective, ClearableInputDirective
    ],
    imports: [
        CommonModule,
        DynamicFormsCoreModule.forRoot(),
        DynamicFormsMaterialUIModule,
        ReactiveFormsModule,
        MatProgressBarModule,
        MatButtonModule,
        GoodiesModule,
        MatSnackBarModule,
        MatDialogModule
    ],
    providers: [{provide: NG_VALIDATORS, useValue: external_validator, multi: true}],
    exports: [InPageDjangoFormComponent, DialogDjangoFormComponent, DjangoFormBaseComponent, AddHtmlEditorsDirective,
        ClearableInputDirective],
    entryComponents: [InPageDjangoFormComponent, DialogDjangoFormComponent, DjangoFormBaseComponent]
})
export class DjangoFormModule {
}
