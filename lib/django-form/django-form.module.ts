import {NgModule} from '@angular/core';
import {DjangoFormComponent} from './django-form.component';
import {DynamicFormsCoreModule} from '@ng-dynamic-forms/core/src/core.module';
import {DynamicFormsMaterialUIModule} from '@ng-dynamic-forms/ui-material/src/dynamic-material-form-ui.module';
import {ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {InternalDjangoFormComponent} from './impl/internal-django-form.component';
import {MdButtonModule, MdProgressBarModule} from '@angular/material';
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
    MdButtonGroupModule
  ],
  providers: [
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
