import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from "@angular/core";
import { BehaviorSubject, EMPTY, merge, Observable, Subject } from "rxjs";
import { MatSnackBar } from "@angular/material";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ErrorService } from "./error-service";
import {
    catchError,
    filter,
    map,
    mergeMap,
    partition,
    shareReplay,
    take,
    tap,
} from "rxjs/operators";
import { DjangoFormConfig } from "./django-form-iface";
import { DjangoFormContentComponent } from "./django-form-content.component";

/**
 * Form component targeted on django rest framework
 */
@Component({
    selector: "django-form-base",
    template: "",
})
export class DjangoFormBaseComponent implements OnInit {
    public config$: Observable<DjangoFormConfig>;
    public errors$ = new Subject<any>();

    /**
     * Returns submitted form data
     *
     */
    @Output()
    public submit = new EventEmitter<{
        data: any;
        response?: any;
        cancel: boolean;
    }>();

    /**
     * Returns cancelled form data
     *
     */
    @Output()
    public cancel = new EventEmitter<{ data: any }>();

    @Input()
    public extraFormData: any;

    @Input()
    public formId: string;

    @Input()
    public extraConfig: any = {};

    @Output()
    valueChanged = new EventEmitter<any>();

    @ViewChild("form")
    protected form: DjangoFormContentComponent;

    private url$ = new BehaviorSubject<string>("");
    private _config$ = new BehaviorSubject<DjangoFormConfig>({});

    constructor(
        private httpClient: HttpClient,
        private snackBar: MatSnackBar,
        private errorService: ErrorService
    ) {}

    @Input()
    public initialDataTransformation: (initialData: any) => any = (x) => x;

    @Input()
    public configTransformation: (
        config: DjangoFormConfig
    ) => DjangoFormConfig = (x) => x;

    @Input()
    public set djangoUrl(_url: string) {
        this.url$.next(_url);
    }

    @Input()
    public set config(_config: any) {
        this._config$.next(_config);
    }

    public ngOnInit(): void {
        console.log("on init called");

        const mergedConfigs: Observable<DjangoFormConfig> = merge(
            this.url$.pipe(
                filter((url) => !!url),
                mergeMap((url: string) => this._downloadDjangoForm(url)), // url is never null here
                shareReplay(1)
            ),
            this._config$.pipe(filter((x) => !!x))
        );

        const initialDataPartitionedConfigs = partition(
            (x: DjangoFormConfig) => x.hasInitialData
        )(mergedConfigs);

        this.config$ = merge(
            // if need initial data, return observable that loads them
            initialDataPartitionedConfigs[0].pipe(
                mergeMap((_config: DjangoFormConfig) =>
                    this.httpClient
                        .get<any>(
                            _config.djangoUrl as string, // never null here
                            {
                                withCredentials: true,
                                params: this.extraFormData,
                            }
                        )
                        .pipe(
                            catchError((error) =>
                                this.errorService.showCommunicationError(error)
                            ),
                            map((response) =>
                                this.initialDataTransformation(response)
                            ),
                            // and add the initial data as a property of the config
                            map((response) => ({
                                ..._config,
                                initialData: response,
                            }))
                        )
                )
            ),
            // otherwise, just return
            initialDataPartitionedConfigs[1]
        ).pipe(
            map((config) => this.configTransformation(config)),
            tap((config) => {
                this.configLoaded(config);
            }),
            shareReplay(1)
        );
    }

    public submitted(buttonId: string, isCancel: boolean) {
        // clone the value so that button clicks are not remembered
        const value = Object.assign({}, this.form.value);
        this._flatten(null, value, null);
        if (buttonId) {
            value[buttonId] = true;
        }
        if (isCancel) {
            this.cancel.emit({ data: value });
        } else {
            this._submitToDjango(value);
        }
    }

    private _downloadDjangoForm(
        djangoUrl: string
    ): Observable<DjangoFormConfig> {
        let djangoFormUrl = djangoUrl;
        if (!djangoFormUrl.endsWith("/")) {
            djangoFormUrl += "/";
        }
        djangoFormUrl += "form/";
        if (this.formId) {
            djangoFormUrl += this.formId + "/";
        }
        return this.httpClient
            .get<DjangoFormConfig>(djangoFormUrl, {
                withCredentials: true,
                params: this.extraFormData,
            })
            .pipe(
                catchError((error) =>
                    this.errorService.showCommunicationError(error)
                ),
                map((config) => ({
                    djangoUrl, // add django url if not present
                    ...config,
                })),
                map((config: DjangoFormConfig) => {
                    config = {
                        ...config,
                        ...this.extraConfig,
                    };
                    if (config.initialData) {
                        // initial data already filled, do not fill them again
                        config.hasInitialData = false;
                    }
                    return config;
                })
            );
    }

    private _submitToDjango(data: any) {
        this.config$.pipe(take(1)).subscribe((config: DjangoFormConfig) => {
            let extra: any;
            if (this.extraFormData instanceof HttpParams) {
                extra = {};
                for (const k of this.extraFormData.keys()) {
                    extra[k] = this.extraFormData.get(k);
                }
            } else {
                extra = this.extraFormData;
            }
            if (config.djangoUrl) {
                let call;
                console.log("Saving to django url", config.djangoUrl);
                switch (config.method) {
                    case "post":
                        call = this.httpClient.post(
                            config.djangoUrl,
                            { ...extra, ...data },
                            { withCredentials: true }
                        );
                        break;
                    case "patch":
                        call = this.httpClient.patch(
                            config.djangoUrl,
                            { ...extra, ...data },
                            { withCredentials: true }
                        );
                        break;
                    default:
                        throw new Error(
                            `Unimplemented method ${config.method}`
                        );
                }
                call.pipe(
                    catchError((error) => {
                        if (error.status === 400) {
                            this.errors$.next(error.error);
                            return EMPTY;
                        }
                        return this.errorService.showCommunicationError(error);
                    })
                ).subscribe((response) => {
                    this.errors$.next(null);
                    this.snackBar.open("Saved", "Dismiss", {
                        duration: 2000,
                        politeness: "polite",
                    });
                    this.submit.emit({
                        response,
                        data,
                        cancel: false,
                    });
                });
            } else {
                this.submit.emit({
                    data,
                    cancel: false,
                });
            }
        });
    }

    private _flatten(name: string | null, current: any, parent: any) {
        if (current !== Object(current)) {
            return;
        }
        for (const k of Object.getOwnPropertyNames(current)) {
            const val = current[k];
            this._flatten(k, val, current);
        }
        if (name && name.startsWith("generated_")) {
            for (const k of Object.getOwnPropertyNames(current)) {
                parent[k] = current[k];
            }
            delete parent[name];
        }
    }

    protected configLoaded(config: any) {}
}
