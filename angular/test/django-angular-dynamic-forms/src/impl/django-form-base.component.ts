import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {MatSnackBar} from '@angular/material';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ErrorService} from './error-service';
import {
    catchError, distinctUntilChanged, filter, map, mergeMap, partition, share, shareReplay,
    tap
} from 'rxjs/operators';
import {DjangoFormConfig} from './django-form-iface';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/partition';
import 'rxjs/add/operator/first';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {DjangoFormContentComponent} from './django-form-content.component';

/**
 * Form component targeted on django rest framework
 */
@Component({
    selector: 'django-form-base',
    template: ''
})
export class DjangoFormBaseComponent implements OnInit {

    private url$ = new BehaviorSubject<string>('');
    public config$: Observable<DjangoFormConfig>;
    private _config$ = new BehaviorSubject<DjangoFormConfig>({});
    public errors$ = new Subject<any>();

    @ViewChild('form') form: DjangoFormContentComponent;

    /**
     * Returns submitted form data
     *
     */
    @Output() submit = new EventEmitter<{ data: any; response?: any, cancel: boolean }>();

    /**
     * Returns cancelled form data
     *
     */
    @Output() cancel = new EventEmitter<{ data: any }>();



    @Input()
    extra_form_data: any;

    @Input()
    form_id: string;

    @Input()
    public extra_config: any = {};

    @Input()
    public initial_data_transformation: (initial_data: any) => any = (x) => x

    @Input()
    public config_transformation: (config: DjangoFormConfig) => DjangoFormConfig = (x) => x

    @Input()
    set django_url(_url: string) {
        this.url$.next(_url);
    }

    @Input()
    set config(_config: any) {
        this._config$.next(_config);
    }

    constructor(private httpClient: HttpClient, private snackBar: MatSnackBar, private error_service: ErrorService) {
    }

    ngOnInit(): void {
        console.log('on init called');
        const _configs = Observable.merge(
            this.url$.pipe(
                filter(url => !!url),
                mergeMap((url: string) => this._download_django_form(url)), // url is never null here
                // map(x => ({
                //     ...this.extra_config,
                //         x
                // })),
                shareReplay(1)
            ),
            this._config$.pipe(
                filter(x => !!x)
            )
        ).partition<DjangoFormConfig>((x: DjangoFormConfig) => !!x.has_initial_data);

        this.config$ = Observable.merge(
            // if need initial data, return observable that loads them
            _configs[0].pipe(
                mergeMap((_config: DjangoFormConfig) => this.httpClient
                    .get<any>(_config.django_url as string,     // never null here
                        {withCredentials: true})
                    .pipe(
                        catchError(error => this.error_service.show_communication_error(error)),
                        map(response => this.initial_data_transformation(response)),
                        // and add the initial data as a property of the config
                        map(response => ({
                            ..._config,
                            initial_data: response
                        })))
                )
            ),
            // otherwise, just return
            _configs[1]
        ).pipe(
            map(config => this.config_transformation(config)),
            shareReplay(1)
        );
    }

    private _download_django_form(django_url: string): Observable<DjangoFormConfig> {
        let django_form_url = django_url;
        if (!django_form_url.endsWith('/')) {
            django_form_url += '/';
        }
        django_form_url += 'form/';
        if (this.form_id) {
            django_form_url += this.form_id + '/';
        }
        return this.httpClient
            .get<DjangoFormConfig>(django_form_url,
                {
                    withCredentials: true,
                    params: this.extra_form_data
                })
            .pipe(
                catchError(error => this.error_service.show_communication_error(error)),
                map(config => (
                    {
                        django_url: django_url,     // add django url if not present
                        ...config
                    }
                )),
                map((config: DjangoFormConfig) => {
                    config = {
                        ...config,
                        ...this.extra_config
                    };
                    if (config.initial_data) {
                        // initial data already filled, do not fill them again
                        config.has_initial_data = false;
                    }
                    return config;
                })
            );
    }

    public submitted(button_id: string, is_cancel: boolean) {
        // clone the value so that button clicks are not remembered
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

    private submit_to_django(data: any) {
        this.config$.first().subscribe((config: DjangoFormConfig) => {
            let extra: any;
            if (this.extra_form_data instanceof HttpParams) {
                extra = {};
                for (const k of this.extra_form_data.keys()) {
                    extra[k] = this.extra_form_data.get(k);
                }
            } else {
                extra = this.extra_form_data;
            }
            if (config.django_url) {
                let call;
                switch (config.method) {
                    case 'post':
                        call = this.httpClient.post(config.django_url, {...extra, ...data}, {withCredentials: true});
                        break;
                    case 'patch':
                        call = this.httpClient.patch(config.django_url, {...extra, ...data}, {withCredentials: true});
                        break;
                    default:
                        throw new Error(`Unimplemented method ${config.method}`);
                }
                call.pipe(
                    catchError(error => {
                        if (error.status === 400) {
                            this.errors$.next(error.error);
                            return Observable.empty();
                        }
                        return this.error_service.show_communication_error(error);
                    })
                ).subscribe(response => {
                    this.errors$.next(null);
                    this.snackBar.open('Saved', 'Dismiss', {
                        duration: 2000,
                        politeness: 'polite'
                    });
                    this.submit.emit({
                        response: response,
                        data: data,
                        cancel: false
                    });
                });
            } else {
                this.submit.emit({
                    data: data,
                    cancel: false
                });
            }
        });
    }

    private _flatten(name: string|null, current: any, parent: any) {
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

    protected _generate_actions(actions: any) {
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
                    id: action_id,
                    label: action_label,
                    color: action_color,
                    cancel: action.cancel
                });
            }
        }
        return ret;
    }
}
