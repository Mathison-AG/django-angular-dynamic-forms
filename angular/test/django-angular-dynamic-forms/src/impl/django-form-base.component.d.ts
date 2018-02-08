import { EventEmitter, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MatSnackBar } from '@angular/material';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from './error-service';
import { DjangoFormConfig } from '../django-form-iface';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/partition';
import 'rxjs/add/operator/first';
import { Subject } from 'rxjs/Subject';
import { DjangoFormContentComponent } from './django-form-content.component';
/**
 * Form component targeted on django rest framework
 */
export declare class DjangoFormBaseComponent implements OnInit {
    private httpClient;
    private snackBar;
    private error_service;
    private url$;
    config$: Observable<DjangoFormConfig>;
    private _config$;
    errors$: Subject<any>;
    form: DjangoFormContentComponent;
    /**
     * Returns submitted form data
     *
     */
    submit: EventEmitter<{
        data: any;
        response?: any;
        cancel: boolean;
    }>;
    /**
     * Returns cancelled form data
     *
     */
    cancel: EventEmitter<{
        data: any;
    }>;
    extra_form_data: any;
    form_id: string;
    extra_config: any;
    initial_data_transformation: (initial_data: any) => any;
    config_transformation: (config: DjangoFormConfig) => DjangoFormConfig;
    django_url: string;
    config: any;
    constructor(httpClient: HttpClient, snackBar: MatSnackBar, error_service: ErrorService);
    ngOnInit(): void;
    private _download_django_form(django_url);
    submitted(button_id: string, is_cancel: boolean): void;
    private submit_to_django(data);
    private _flatten(name, current, parent);
    protected _generate_actions(actions: any): {
        id: any;
        label: any;
        color: string;
        cancel: any;
    }[];
}
