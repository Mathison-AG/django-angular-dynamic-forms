import { MatSnackBar } from '@angular/material';
import { DjangoFormBaseComponent } from './django-form-base.component';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from './error-service';
export declare class InPageDjangoFormComponent extends DjangoFormBaseComponent {
    constructor(http: HttpClient, snackBar: MatSnackBar, error_service: ErrorService);
}
