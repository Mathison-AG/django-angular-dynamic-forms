"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
require("rxjs/add/observable/throw");
var material_1 = require("@angular/material");
var dialog_django_form_component_1 = require("./impl/dialog-django-form.component");
var core_1 = require("@angular/core");
var DjangoFormDialogService = /** @class */ (function () {
    function DjangoFormDialogService(dialog) {
        this.dialog = dialog;
    }
    DjangoFormDialogService.prototype.open = function (django_url, extra_options) {
        if (!extra_options) {
            extra_options = {};
        }
        var dialogRef = this.dialog.open(dialog_django_form_component_1.DialogDjangoFormComponent, {
            // width: '250px',
            data: {
                django_url: django_url,
                config: extra_options.config,
                extra_form_data: extra_options.extra_form_data || {},
                initial_data_transformation: extra_options.initial_data_transformation,
                config_transformation: extra_options.config_transformation,
                form_id: extra_options.form_id
            }
        });
        return dialogRef
            .afterClosed()
            .map(function (result) { return result || { cancel: true, data: undefined }; });
    };
    DjangoFormDialogService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [material_1.MatDialog])
    ], DjangoFormDialogService);
    return DjangoFormDialogService;
}());
exports.DjangoFormDialogService = DjangoFormDialogService;

//# sourceMappingURL=django-form-dialog.service.js.map
