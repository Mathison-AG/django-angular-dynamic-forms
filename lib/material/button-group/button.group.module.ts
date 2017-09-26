import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdButtonModule} from '@angular/material';
import {MatButtonGroupComponent} from './button-group.component';

@NgModule({
  declarations: [
    MatButtonGroupComponent,
  ],
  imports: [
    CommonModule,
    MdButtonModule,
  ],
  providers: [
  ],
  exports: [
    MatButtonGroupComponent
  ],
})
export class MatButtonGroupModule {
}
