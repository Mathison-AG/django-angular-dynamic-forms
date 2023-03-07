import { NgModule } from "@angular/core";
import { DynamicFormsCoreModule } from "@ng-dynamic-forms/core";
import { DynamicFormsMaterialUIModule } from "@ng-dynamic-forms/ui-material";
import { NG_VALIDATORS, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { InPageDjangoFormComponent } from "./impl/inpage-django-form.component";
import {
    MatButtonModule,
    MatDialogModule,
    MatProgressBarModule,
    MatSnackBarModule,
} from "@angular/material";
import {
    DjangoFormContentComponent,
    externalValidator,
} from "./impl/django-form-content.component";
import { DialogDjangoFormComponent } from "./impl/dialog-django-form.component";
import { DjangoFormBaseComponent } from "./impl/django-form-base.component";
import { DjangoFormDialogService } from "./django-form-dialog.service";

@NgModule({
    declarations: [
        InPageDjangoFormComponent,
        DjangoFormContentComponent,
        DialogDjangoFormComponent,
        DjangoFormBaseComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DynamicFormsCoreModule,
        DynamicFormsMaterialUIModule,
        MatProgressBarModule,
        MatButtonModule,
        MatSnackBarModule,
        MatDialogModule,
    ],
    providers: [
        { provide: NG_VALIDATORS, useValue: externalValidator, multi: true },
        DjangoFormDialogService,
    ],
    exports: [
        InPageDjangoFormComponent,
        DialogDjangoFormComponent,
        DjangoFormBaseComponent,
    ],
    entryComponents: [
        InPageDjangoFormComponent,
        DialogDjangoFormComponent,
        DjangoFormBaseComponent,
    ],
})
export class DjangoFormModule {}
