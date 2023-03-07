import { Component, Inject } from "@angular/core";
import { DjangoFormBaseComponent } from "./django-form-base.component";
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from "@angular/material";
import { HttpClient } from "@angular/common/http";
import { ErrorService } from "./error-service";
import { DjangoDialogConfig } from "./django-form-iface";

@Component({
    selector: "django-dialog-form",
    templateUrl: "./dialog-django-form.component.html",
    styleUrls: ["./dialog-django-form.component.scss"],
})
export class DialogDjangoFormComponent extends DjangoFormBaseComponent {
    constructor(
        httpClient: HttpClient,
        snackBar: MatSnackBar,
        dialogRef: MatDialogRef<DialogDjangoFormComponent>,
        @Inject(MAT_DIALOG_DATA) data: DjangoDialogConfig,
        errorService: ErrorService
    ) {
        super(httpClient, snackBar, errorService);

        this.submit.subscribe(
            (info: { data: any; response?: any; cancel: boolean }) => {
                info.cancel = false;
                dialogRef.close(info);
            }
        );
        this.cancel.subscribe((info: { data: any; cancel: boolean }) => {
            info.cancel = true;
            dialogRef.close(info);
        });

        if (!data.config && !data.djangoUrl) {
            throw new Error("Please specify either config or djangoUrl");
        }

        this.extraFormData = data.extraFormData;

        if (data.initialDataTransformation) {
            this.initialDataTransformation = data.initialDataTransformation;
        }

        if (data.configTransformation) {
            this.configTransformation = data.configTransformation;
        }

        if (data.formId) {
            this.formId = data.formId;
        }

        if (data.config) {
            if (data.djangoUrl) {
                this.extraConfig = data.config;
            } else {
                this.config = data.config;
            }
        }

        if (data.djangoUrl) {
            this.djangoUrl = data.djangoUrl;
        }
    }
}
