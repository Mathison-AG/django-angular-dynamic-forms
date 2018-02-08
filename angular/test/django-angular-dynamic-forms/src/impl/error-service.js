"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/empty");
var ErrorService = /** @class */ (function () {
    function ErrorService() {
    }
    ErrorService.prototype.show_error = function (message, options) {
        console.error(message, 'will be shown for', options && options.duration);
    };
    ErrorService.prototype.show_communication_error = function (response) {
        var message = response.message || response;
        if (response.error) {
            message += ' : ' + response.error;
        }
        this.show_error("Communication error: " + message, {
            duration: 60000,
        });
        return Observable_1.Observable.empty();
    };
    ErrorService = __decorate([
        core_1.Injectable()
    ], ErrorService);
    return ErrorService;
}());
exports.ErrorService = ErrorService;

//# sourceMappingURL=error-service.js.map
