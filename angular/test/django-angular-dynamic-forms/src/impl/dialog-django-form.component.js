"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var django_form_base_component_1 = require("./django-form-base.component");
var material_1 = require("@angular/material");
var http_1 = require("@angular/common/http");
var error_service_1 = require("./error-service");
var DialogDjangoFormComponent = /** @class */ (function (_super) {
    __extends(DialogDjangoFormComponent, _super);
    function DialogDjangoFormComponent(httpClient, snackBar, dialogRef, data, error_service) {
        var _this = _super.call(this, httpClient, snackBar, error_service) || this;
        _this.submit.subscribe(function (info) {
            info.cancel = false;
            dialogRef.close(info);
        });
        _this.cancel.subscribe(function (info) {
            info.cancel = true;
            dialogRef.close(info);
        });
        if (!data.config && !data.django_url) {
            throw new Error('Please specify either config or django_url');
        }
        _this.extra_form_data = data.extra_form_data;
        if (data.initial_data_transformation) {
            _this.initial_data_transformation = data.initial_data_transformation;
        }
        if (data.config_transformation) {
            _this.config_transformation = data.config_transformation;
        }
        if (data.form_id) {
            _this.form_id = data.form_id;
        }
        if (data.config) {
            if (data.django_url) {
                _this.extra_config = data.config;
            }
            else {
                _this.config = data.config;
            }
        }
        if (data.django_url) {
            _this.django_url = data.django_url;
        }
        return _this;
    }
    DialogDjangoFormComponent = __decorate([
        core_1.Component({
            selector: 'dialog-django-form',
            templateUrl: './dialog-django-form.component.html',
            styleUrls: ['./dialog-django-form.component.scss']
        }),
        __param(3, core_1.Inject(material_1.MAT_DIALOG_DATA)),
        __metadata("design:paramtypes", [http_1.HttpClient,
            material_1.MatSnackBar,
            material_1.MatDialogRef, Object, error_service_1.ErrorService])
    ], DialogDjangoFormComponent);
    return DialogDjangoFormComponent;
}(django_form_base_component_1.DjangoFormBaseComponent));
exports.DialogDjangoFormComponent = DialogDjangoFormComponent;

//# sourceMappingURL=dialog-django-form.component.js.map
