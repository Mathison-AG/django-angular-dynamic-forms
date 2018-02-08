"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var core_2 = require("@ng-dynamic-forms/core");
var ui_material_1 = require("@ng-dynamic-forms/ui-material");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var inpage_django_form_component_1 = require("./impl/inpage-django-form.component");
var material_1 = require("@angular/material");
var django_form_content_component_1 = require("./impl/django-form-content.component");
var dialog_django_form_component_1 = require("./impl/dialog-django-form.component");
var django_form_base_component_1 = require("./impl/django-form-base.component");
var django_form_dialog_service_1 = require("./django-form-dialog.service");
var DjangoFormModule = /** @class */ (function () {
    function DjangoFormModule() {
    }
    DjangoFormModule = __decorate([
        core_1.NgModule({
            declarations: [inpage_django_form_component_1.InPageDjangoFormComponent, django_form_content_component_1.DjangoFormContentComponent,
                dialog_django_form_component_1.DialogDjangoFormComponent, django_form_base_component_1.DjangoFormBaseComponent,
            ],
            imports: [
                common_1.CommonModule,
                core_2.DynamicFormsCoreModule.forRoot(),
                ui_material_1.DynamicFormsMaterialUIModule,
                forms_1.ReactiveFormsModule,
                material_1.MatProgressBarModule,
                material_1.MatButtonModule,
                material_1.MatSnackBarModule,
                material_1.MatDialogModule
            ],
            providers: [
                { provide: forms_1.NG_VALIDATORS, useValue: django_form_content_component_1.external_validator, multi: true },
                django_form_dialog_service_1.DjangoFormDialogService
            ],
            exports: [inpage_django_form_component_1.InPageDjangoFormComponent, dialog_django_form_component_1.DialogDjangoFormComponent, django_form_base_component_1.DjangoFormBaseComponent],
            entryComponents: [inpage_django_form_component_1.InPageDjangoFormComponent, dialog_django_form_component_1.DialogDjangoFormComponent, django_form_base_component_1.DjangoFormBaseComponent]
        })
    ], DjangoFormModule);
    return DjangoFormModule;
}());
exports.DjangoFormModule = DjangoFormModule;

//# sourceMappingURL=django-form.module.js.map
