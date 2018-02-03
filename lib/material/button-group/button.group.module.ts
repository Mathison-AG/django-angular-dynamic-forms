import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material';
import {MatButtonGroupComponent} from './button-group.component';

@NgModule({
  declarations: [
    MatButtonGroupComponent,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
  ],
  providers: [
  ],
  exports: [
    MatButtonGroupComponent
  ],
})
export class MatButtonGroupModule {
}
