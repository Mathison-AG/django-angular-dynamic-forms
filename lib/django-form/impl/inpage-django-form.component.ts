import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { DjangoFormBaseComponent } from './django-form-base.component';
import {HttpClient} from '@angular/common/http';
import {ErrorService} from './error-service';

@Component({
  selector: 'inpage-django-form',
  templateUrl: './inpage-django-form.component.html',
  styleUrls: ['./inpage-django-form.component.scss']
})
export class InPageDjangoFormComponent extends DjangoFormBaseComponent {
  constructor(http: HttpClient, snackBar: MatSnackBar, error_service: ErrorService) {
    super(http, snackBar, error_service);
  }
}
