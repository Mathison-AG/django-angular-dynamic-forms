import {
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {InternalDjangoFormComponent} from './impl/internal-django-form.component';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {MdSnackBar} from '@angular/material';

/**
 * Form component targeted on django rest framework
 */
@Component({
    selector: 'django-form-component',
    templateUrl: './django-form.component.html',
    styleUrls: ['./django-form.component.scss'],
})
export class DjangoFormComponent implements OnInit {
    private _config: any;
    private _django_url: any;
    private loading = false;
    private data: any;
    private form_title: string;

    @ViewChild('dynamicComponentContainer', {read: ViewContainerRef}) target: ViewContainerRef;
    private _internal_form: ComponentRef<InternalDjangoFormComponent>;

    @Input()
    set config(_config: any) {
        this._config = _config;
        this.form_title = _config.form_title;
    }

    @Input()
    set django_url(_url: string) {
        this._django_url = _url;
    }

    /**
     * Returns submitted form data
     *
     * @type {EventEmitter<any>}
     */
    @Output()
    submit = new EventEmitter();

    /**
     * Returns cancelled form data
     *
     * @type {EventEmitter<any>}
     */
    @Output()
    cancel = new EventEmitter();

    constructor(private resolver: ComponentFactoryResolver, private http: Http, private snackBar: MdSnackBar) {
    }

    ngOnInit(): void {
        if (this._django_url) {
            this._download_django_form().subscribe(config => {
                this.config = config;
                this._create_form();
                if (config.has_initial_data) {
                    this._load_initial_data();
                }
            });
        } else {
            this._create_form();
        }
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

    private _create_form() {
        this.target.clear();
        if (this._internal_form) {
            this._internal_form.destroy();
        }
        const childComponent = this.resolver.resolveComponentFactory(InternalDjangoFormComponent);
        this._internal_form = this.target.createComponent(childComponent);
        this._internal_form.instance.config = this._config;
        this._internal_form.instance.submit.subscribe(data => this.submitted(data));
        this._internal_form.instance.cancel.subscribe(data => this.cancelled(data));
        this._internal_form.instance.form_title = this.form_title;
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
                this._internal_form.instance.set_initial_data(response);
            });
    }

    private submitted(data) {
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
                    this._internal_form.instance.errors = error.json();
                    return Observable.throw(error);
                })
                .subscribe(response => {
                    this._internal_form.instance.errors = null;
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
        }
    }

    private cancelled(data) {
        this.cancel.emit({
            data: data
        });
    }
}
