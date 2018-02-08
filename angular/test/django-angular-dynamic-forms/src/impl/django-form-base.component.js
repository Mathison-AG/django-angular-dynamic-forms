"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var Observable_1 = require("rxjs/Observable");
var material_1 = require("@angular/material");
var http_1 = require("@angular/common/http");
var error_service_1 = require("./error-service");
var operators_1 = require("rxjs/operators");
require("rxjs/add/observable/merge");
require("rxjs/add/operator/partition");
require("rxjs/add/operator/first");
var Subject_1 = require("rxjs/Subject");
var django_form_content_component_1 = require("./django-form-content.component");
/**
 * Form component targeted on django rest framework
 */
var DjangoFormBaseComponent = /** @class */ (function () {
    function DjangoFormBaseComponent(httpClient, snackBar, error_service) {
        this.httpClient = httpClient;
        this.snackBar = snackBar;
        this.error_service = error_service;
        this.url$ = new Subject_1.Subject();
        this._config$ = new Subject_1.Subject();
        this.errors$ = new Subject_1.Subject();
        /**
         * Returns submitted form data
         *
         */
        this.submit = new core_1.EventEmitter();
        /**
         * Returns cancelled form data
         *
         */
        this.cancel = new core_1.EventEmitter();
        this.extra_config = {};
        this.initial_data_transformation = function (x) { return x; };
        this.config_transformation = function (x) { return x; };
    }
    Object.defineProperty(DjangoFormBaseComponent.prototype, "django_url", {
        set: function (_url) {
            this.url$.next(_url);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DjangoFormBaseComponent.prototype, "config", {
        set: function (_config) {
            this._config$.next(_config);
        },
        enumerable: true,
        configurable: true
    });
    DjangoFormBaseComponent.prototype.ngOnInit = function () {
        var _this = this;
        console.log('on init called');
        var _configs = Observable_1.Observable.merge(this.url$.pipe(operators_1.filter(function (url) { return !!url; }), operators_1.mergeMap(function (url) { return _this._download_django_form(url); }), // url is never null here
        // map(x => ({
        //     ...this.extra_config,
        //         x
        // })),
        operators_1.shareReplay(1)), this._config$.pipe(operators_1.filter(function (x) { return !!x; }))).partition(function (x) { return !!x.has_initial_data; });
        this.config$ = Observable_1.Observable.merge(
        // if need initial data, return observable that loads them
        _configs[0].pipe(operators_1.mergeMap(function (_config) { return _this.httpClient
            .get(_config.django_url, // never null here
        { withCredentials: true })
            .pipe(operators_1.catchError(function (error) { return _this.error_service.show_communication_error(error); }), operators_1.map(function (response) { return _this.initial_data_transformation(response); }), 
        // and add the initial data as a property of the config
        operators_1.map(function (response) { return (__assign({}, _config, { initial_data: response })); })); })), 
        // otherwise, just return
        _configs[1]).pipe(operators_1.map(function (config) { return _this.config_transformation(config); }), operators_1.shareReplay(1));
    };
    DjangoFormBaseComponent.prototype._download_django_form = function (django_url) {
        var _this = this;
        var django_form_url = django_url;
        if (!django_form_url.endsWith('/')) {
            django_form_url += '/';
        }
        django_form_url += 'form/';
        if (this.form_id) {
            django_form_url += this.form_id + '/';
        }
        return this.httpClient
            .get(django_form_url, {
            withCredentials: true,
            params: this.extra_form_data
        })
            .pipe(operators_1.catchError(function (error) { return _this.error_service.show_communication_error(error); }), operators_1.map(function (config) { return (__assign({ django_url: django_url }, config)); }), operators_1.map(function (config) {
            config = __assign({}, config, _this.extra_config);
            if (config.initial_data) {
                // initial data already filled, do not fill them again
                config.has_initial_data = false;
            }
            return config;
        }));
    };
    DjangoFormBaseComponent.prototype.submitted = function (button_id, is_cancel) {
        // clone the value so that button clicks are not remembered
        var value = Object.assign({}, this.form.value);
        this._flatten(null, value, null);
        if (button_id) {
            value[button_id] = true;
        }
        if (is_cancel) {
            this.cancel.emit({ data: value });
        }
        else {
            this.submit_to_django(value);
        }
    };
    DjangoFormBaseComponent.prototype.submit_to_django = function (data) {
        var _this = this;
        this.config$.first().subscribe(function (config) {
            var extra;
            if (_this.extra_form_data instanceof http_1.HttpParams) {
                extra = {};
                for (var _i = 0, _a = _this.extra_form_data.keys(); _i < _a.length; _i++) {
                    var k = _a[_i];
                    extra[k] = _this.extra_form_data.get(k);
                }
            }
            else {
                extra = _this.extra_form_data;
            }
            if (config.django_url) {
                var call = void 0;
                switch (config.method) {
                    case 'post':
                        call = _this.httpClient.post(config.django_url, __assign({}, extra, data), { withCredentials: true });
                        break;
                    case 'patch':
                        call = _this.httpClient.patch(config.django_url, __assign({}, extra, data), { withCredentials: true });
                        break;
                    default:
                        throw new Error("Unimplemented method " + config.method);
                }
                call.pipe(operators_1.catchError(function (error) {
                    if (error.status === 400) {
                        _this.errors$.next(error.error);
                        return Observable_1.Observable.empty();
                    }
                    return _this.error_service.show_communication_error(error);
                })).subscribe(function (response) {
                    _this.errors$.next(null);
                    _this.snackBar.open('Saved', 'Dismiss', {
                        duration: 2000,
                        politeness: 'polite'
                    });
                    _this.submit.emit({
                        response: response,
                        data: data,
                        cancel: false
                    });
                });
            }
            else {
                _this.submit.emit({
                    data: data,
                    cancel: false
                });
            }
        });
    };
    DjangoFormBaseComponent.prototype._flatten = function (name, current, parent) {
        if (current !== Object(current)) {
            return;
        }
        for (var _i = 0, _a = Object.getOwnPropertyNames(current); _i < _a.length; _i++) {
            var k = _a[_i];
            var val = current[k];
            this._flatten(k, val, current);
        }
        if (name && name.startsWith('generated_')) {
            for (var _b = 0, _c = Object.getOwnPropertyNames(current); _b < _c.length; _b++) {
                var k = _c[_b];
                parent[k] = current[k];
            }
            delete parent[name];
        }
    };
    DjangoFormBaseComponent.prototype._generate_actions = function (actions) {
        var ret = [];
        if (actions) {
            for (var _i = 0, actions_1 = actions; _i < actions_1.length; _i++) {
                var action = actions_1[_i];
                var action_id = void 0;
                var action_label = void 0;
                var action_cancel = false;
                var action_color = 'primary';
                if (Array.isArray(action)) {
                    action_id = action[0];
                    action_label = action[1];
                    if (action_label === undefined) {
                        action_label = action_id;
                    }
                }
                else if (Object(action) !== action) {
                    action_id = action_label = action;
                }
                else {
                    action_id = action.id;
                    action_label = action.label;
                    action_cancel = action.cancel;
                    if (action.color) {
                        action_color = action.color;
                    }
                }
                ret.push({
                    id: action_id,
                    label: action_label,
                    color: action_color,
                    cancel: action.cancel
                });
            }
        }
        return ret;
    };
    __decorate([
        core_1.ViewChild('form'),
        __metadata("design:type", django_form_content_component_1.DjangoFormContentComponent)
    ], DjangoFormBaseComponent.prototype, "form", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], DjangoFormBaseComponent.prototype, "submit", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], DjangoFormBaseComponent.prototype, "cancel", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], DjangoFormBaseComponent.prototype, "extra_form_data", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], DjangoFormBaseComponent.prototype, "form_id", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], DjangoFormBaseComponent.prototype, "extra_config", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Function)
    ], DjangoFormBaseComponent.prototype, "initial_data_transformation", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Function)
    ], DjangoFormBaseComponent.prototype, "config_transformation", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String),
        __metadata("design:paramtypes", [String])
    ], DjangoFormBaseComponent.prototype, "django_url", null);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], DjangoFormBaseComponent.prototype, "config", null);
    DjangoFormBaseComponent = __decorate([
        core_1.Component({
            selector: 'django-form-base',
            template: ''
        }),
        __metadata("design:paramtypes", [http_1.HttpClient, material_1.MatSnackBar, error_service_1.ErrorService])
    ], DjangoFormBaseComponent);
    return DjangoFormBaseComponent;
}());
exports.DjangoFormBaseComponent = DjangoFormBaseComponent;

//# sourceMappingURL=django-form-base.component.js.map
