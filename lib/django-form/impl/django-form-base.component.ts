import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {MatSnackBar} from '@angular/material';

/**
 * Form component targeted on django rest framework
 */
@Component({
    selector: 'django-form-base',
    template: ''
})
export class DjangoFormBaseComponent implements OnInit {
    layout: any;
    errors: any;
    loading: boolean;
    actions: any;
    initial_data: any;

    @Input()
    form_title: string;

    /**
     * Returns submitted form data
     *
     * @type {EventEmitter<any>}
     */
    @Output()
    submit = new EventEmitter<{data: any, response?: any}>();

    /**
     * Returns cancelled form data
     *
     * @type {EventEmitter<any>}
     */
    @Output()
    cancel = new EventEmitter<{data: any}>();

    @ViewChild('form') form;

    private _config: any;
    private _django_url: string;

    @Input()
    set django_url(_url: string) {
        this._django_url = _url;
    }

    @Input()
    set config(_config: any) {
        this._config = _config;
        if (_config) {
            this.form_title = _config.form_title;
            this.actions = DjangoFormBaseComponent._generate_actions(_config.actions);
            this.layout = _config.layout;
        }
    }


    static _generate_actions(actions) {
        const ret = [];
        if (actions) {
            for (const action of actions) {
                let action_id;
                let action_label;
                let action_cancel = false;
                let action_color = 'primary';

                if (Array.isArray(action)) {
                    action_id = action[0];
                    action_label = action[1];
                    if (action_label === undefined) {
                        action_label = action_id;
                    }
                } else if (Object(action) !== action) {
                    action_id = action_label = action;
                } else {
                    action_id = action.id;
                    action_label = action.label;
                    action_cancel = action.cancel;
                    if (action.color) {
                        action_color = action.color;
                    }
                }
                ret.push({
                    'id': action_id,
                    'label': action_label,
                    'color': action_color,
                    'cancel': action.cancel
                });
            }
        }
        return ret;
    }

    constructor(private http: Http,
                private snackBar: MatSnackBar) {
    }

    ngOnInit(): void {
        if (this._django_url) {
            this._download_django_form().subscribe(config => {
                this.config = config;
                if (config.has_initial_data) {
                    this._load_initial_data();
                }
            });
        }
    }

    private _load_initial_data() {
        this.loading = true;
        this.http.get(this._django_url)
            .map(response => response.json())
            .catch((error) => {
                // TODO: handle error
                setTimeout(() => {
                    this.snackBar.open(error, 'Dismiss', {
                        duration: 2000,
                    });
                });
                return Observable.throw(error);
            })
            .subscribe(response => {
                this.loading = false;
                this.initial_data = response;
            });
    }

    private _download_django_form(): Observable<any> {
        this.loading = true;
        let django_form_url = this._django_url;
        if (!django_form_url.endsWith('/')) {
            django_form_url += '/';
        }
        django_form_url += 'form';
        return this.http.get(django_form_url).map(response => {
            this.loading = false;
            return response.json();
        });
    }

    protected submitted(button_id, is_cancel) {
        // clone the value so that button clicks are not remembered
        console.log('value', this.form.value);
        const value = Object.assign({}, this.form.value);
        this._flatten(null, value, null);
        if (button_id) {
            value[button_id] = true;
        }
        if (is_cancel) {
            this.cancel.emit({data: value});
        } else {
            this.submit_to_django(value);
        }
    }

    private submit_to_django(data) {
        if (this._django_url) {
            let call;
            switch (this._config.method) {
                case 'post':
                    call = this.http.post(this._django_url, data);
                    break;
                case 'patch':
                    call = this.http.patch(this._django_url, data);
                    break;
                default:
                    throw new Error(`Unimplemented method ${this._config.method}`);
            }
            call.map(response => response.json())
                .catch((error) => {
                    setTimeout(() => {
                        this.snackBar.open(error, 'Dismiss', {
                            duration: 10000,
                        });
                    });
                    this.errors = error.json();
                    return Observable.throw(error);
                })
                .subscribe(response => {
                    this.errors = null;
                    this.snackBar.open('Saved', 'Dismiss', {
                        duration: 2000,
                        politeness: 'polite'
                    });
                    this.submit.emit({
                            response: response,
                            data: data
                        }
                    );
                });
        } else {
            this.submit.emit({
                    data: data
                }
            );
        }
    }


    private _flatten(name, current, parent) {
        if (current !== Object(current)) {
            return;
        }
        for (const k of Object.getOwnPropertyNames(current)) {
            const val = current[k];
            this._flatten(k, val, current);
        }
        if (name && name.startsWith('generated_')) {
            for (const k of Object.getOwnPropertyNames(current)) {
                parent[k] = current[k];
            }
            delete parent[name];
        }
    }
}
