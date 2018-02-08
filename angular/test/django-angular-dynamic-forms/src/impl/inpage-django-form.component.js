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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var material_1 = require("@angular/material");
var django_form_base_component_1 = require("./django-form-base.component");
var http_1 = require("@angular/common/http");
var error_service_1 = require("./error-service");
var InPageDjangoFormComponent = /** @class */ (function (_super) {
    __extends(InPageDjangoFormComponent, _super);
    function InPageDjangoFormComponent(http, snackBar, error_service) {
        return _super.call(this, http, snackBar, error_service) || this;
    }
    InPageDjangoFormComponent = __decorate([
        core_1.Component({
            selector: 'inpage-django-form',
            templateUrl: './inpage-django-form.component.html',
            styleUrls: ['./inpage-django-form.component.scss']
        }),
        __metadata("design:paramtypes", [http_1.HttpClient, material_1.MatSnackBar, error_service_1.ErrorService])
    ], InPageDjangoFormComponent);
    return InPageDjangoFormComponent;
}(django_form_base_component_1.DjangoFormBaseComponent));
exports.InPageDjangoFormComponent = InPageDjangoFormComponent;

//# sourceMappingURL=inpage-django-form.component.js.map
