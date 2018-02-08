import { Injectable } from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {ErrorService} from '../django-form';

@Injectable()
export class MatErrorService extends ErrorService {

  constructor(private service: MatSnackBar) {
      super();
  }

      show_error(message, options?: {
        duration?: number
    }) {
        this.service.open(message, 'Zavřít', {
            duration: (options && options.duration) || 15000,
            politeness: 'assertive'
        })
    }
}
