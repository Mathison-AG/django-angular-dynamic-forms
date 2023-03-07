import { MatDialog } from "@angular/material";
import { DialogDjangoFormComponent } from "./impl/dialog-django-form.component";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DjangoDialogConfig } from "./impl/django-form-iface";
import { map } from "rxjs/operators";

@Injectable()
export class DjangoFormDialogService {
    constructor(private dialog: MatDialog) {}

    public open(
        djangoUrl: string,
        extraOptions?: DjangoDialogConfig
    ): Observable<any> {
        if (!extraOptions) {
            extraOptions = {};
        }

        const dialogRef = this.dialog.open(DialogDjangoFormComponent, {
            // width: '250px',
            maxHeight: "90vh",
            height: "auto",
            maxWidth: "90vw",
            width: "auto",
            data: {
                djangoUrl,
                config: extraOptions.config,
                extraFormData: extraOptions.extraFormData || {},
                initialDataTransformation:
                    extraOptions.initialDataTransformation,
                configTransformation: extraOptions.configTransformation,
                formId: extraOptions.formId,
            },
        });

        return dialogRef
            .afterClosed()
            .pipe(
                map(
                    (result: any) => result || { cancel: true, data: undefined }
                )
            );
    }
}
