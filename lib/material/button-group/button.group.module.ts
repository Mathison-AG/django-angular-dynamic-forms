import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdButtonModule} from '@angular/material';
import {MdButtonGroupComponent} from './button-group.component';

@NgModule({
  declarations: [
    MdButtonGroupComponent,
  ],
  imports: [
    CommonModule,
    MdButtonModule,
  ],
  providers: [
  ],
  exports: [
    MdButtonGroupComponent
  ],
})
export class MdButtonGroupModule {
}
