import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CookieXSRFStrategy, HttpModule, XSRFStrategy} from '@angular/http';

import {AppComponent} from './app.component';
import {DynamicFormModule} from '../../dynamic-form/dynamic-form.module';

export function xsrfFactory() {
  return new CookieXSRFStrategy('csrftoken', 'X-CSRFToken');
}


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    DynamicFormModule
  ],
  providers: [
    {
      // use django csrf cookie for HTTP PUT/POST/DELETE
      provide: XSRFStrategy,
      useFactory : xsrfFactory
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
