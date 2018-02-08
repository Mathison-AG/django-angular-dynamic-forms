import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { DjangoDialogConfig } from './django-form-iface';
export declare class DjangoFormDialogService {
    private dialog;
    constructor(dialog: MatDialog);
    open(django_url: string, extra_options?: DjangoDialogConfig): Observable<any>;
}
