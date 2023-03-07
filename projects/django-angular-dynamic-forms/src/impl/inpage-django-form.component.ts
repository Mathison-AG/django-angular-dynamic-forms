import { Component, EventEmitter, Output } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { DjangoFormBaseComponent } from "./django-form-base.component";
import { HttpClient } from "@angular/common/http";
import { ErrorService } from "./error-service";

@Component({
    selector: "django-inpage-form",
    templateUrl: "./inpage-django-form.component.html",
    styleUrls: ["./inpage-django-form.component.scss"],
})
export class InPageDjangoFormComponent extends DjangoFormBaseComponent {
    @Output()
    shown = new EventEmitter<{ form: DjangoFormBaseComponent; config: any }>();

    constructor(
        http: HttpClient,
        snackBar: MatSnackBar,
        errorService: ErrorService
    ) {
        super(http, snackBar, errorService);
    }

    protected configLoaded(config: any) {
        if (Object.keys(config).length > 0) {
            this.shown.emit({ form: this, config: config });
        }
    }

    onModified(data: any) {
        this.valueChanged.emit(data);
    }
}
