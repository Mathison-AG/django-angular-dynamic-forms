import { DjangoFormBaseComponent } from './django-form-base.component';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from './error-service';
import { DjangoDialogConfig } from './django-form-iface';
export declare class DialogDjangoFormComponent extends DjangoFormBaseComponent {
    constructor(httpClient: HttpClient, snackBar: MatSnackBar, dialogRef: MatDialogRef<DialogDjangoFormComponent>, data: DjangoDialogConfig, error_service: ErrorService);
}
