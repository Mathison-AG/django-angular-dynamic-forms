import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CookieXSRFStrategy, HttpModule, XSRFStrategy} from '@angular/http';
import {DynamicFormsCoreModule} from '@ng-dynamic-forms/core';

import {AppComponent} from './app.component';
import {DynamicFormService} from '@ng-dynamic-forms/core/src/service/dynamic-form.service';
import {DynamicFormValidationService} from '@ng-dynamic-forms/core/src/service/dynamic-form-validation.service';
import {DynamicFormsMaterialUIModule} from '@ng-dynamic-forms/ui-material/src/dynamic-material-form-ui.module';
import {MaterialModule, MdCardModule, MdProgressSpinnerModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DjangoFormModule} from '../../django-form/django-form.module';
import {FlexLayoutModule} from "@angular/flex-layout";


export function xsrfFactory() {
  return new CookieXSRFStrategy('csrftoken', 'X-CSRFToken');
}


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    DynamicFormsCoreModule.forRoot(),
    DynamicFormsMaterialUIModule,
    MdCardModule,
    MaterialModule,
    DjangoFormModule,
    MdProgressSpinnerModule,
    FlexLayoutModule
  ],
  providers: [
    {
      // use django csrf cookie for HTTP PUT/POST/DELETE
      provide: XSRFStrategy,
      useFactory: xsrfFactory
    },
    DynamicFormService,
    DynamicFormValidationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
