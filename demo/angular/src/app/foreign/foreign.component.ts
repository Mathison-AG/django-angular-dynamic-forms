import {Component, NgModule, OnInit, ViewChild} from '@angular/core';
import {CodeSampleComponent} from '../code-sample/code-sample.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {debounceTime, distinctUntilChanged, map, mergeMap} from 'rxjs/operators';
import {FormBuilder, FormGroup} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {of as observableOf} from 'rxjs/observable/of';
import {SampleForeignSelectorComponent} from './sample-foreign-selector.component';
import {HighlightJsService} from 'angular2-highlight-js';
import {MatErrorService} from '../mat-error.service';

@Component({
    selector: 'app-create-in-page',
    template: `
        <h1>Reference to foreign key</h1>

        <div fxLayout="row">
            <div class='bordered' fxFlex="50" fxFlex.sm="100">
                <inpage-django-form djangoUrl="/api/1.0/addresses/" (submit)="submit($event)"
                                    (cancel)="cancel($event)">
                </inpage-django-form>
            </div>
        </div>

        <code-sample [tabs]="tabs"></code-sample>
    `,
    styles: [`
        .bordered {
            border: 1px solid lightblue;
            padding: 20px;
        }
    `]
})
export class ForeignComponent implements OnInit {
    @ViewChild(CodeSampleComponent)
    code: CodeSampleComponent;

    tabs = [
        {
            tab: 'Typescript',
            text: `
    submit(data) {
        console.log('Saved, got response', data);
    }

    cancel(data) {
        console.log('cancelled, form data', data);
    }
    `
        },
        {
            tab: 'Page Template',
            text: `
<div class='bordered' fxFlex="50" fxFlex.sm="100">
    <inpage-django-form djangoUrl="/api/1.0/addresses/" 
                        (submit)="submit($event)" 
                        (cancel)="cancel($event)"></inpage-django-form>
</div>`
        },
        {
            tab: 'Python',
            text: `
class Address(models.Model):
    street = models.CharField(max_length=100, null=True, blank=True)
    number = models.CharField(max_length=100, null=True, blank=True)
    city = models.ForeignKey(City, null=True, blank=True, on_delete=models.SET_NULL)

class AddressViewSet(ForeignFieldAutoCompleteMixin, AngularFormMixin, viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = (permissions.AllowAny,)

    @foreign_field_autocomplete(field='city', serializer=CitySerializer)
    def city_autocomplete(self, request):
        query = request.GET.get('query')
        qs = City.objects.all().order_by('name')
        if query:
            qs = qs.filter(name__icontains=query)
        return qs
            `
        },
        {
            tab: 'SampleForeignSelectorComponent.ts',
            text: `
@Component({
    selector: 'app-sample-foreign-selector',
    ...
})
export class SampleForeignSelectorComponent implements ForeignFieldLookupComponent {

    public form: FormGroup;
    public cities$: Observable<any[]>;

    constructor(public dialogRef: MatDialogRef<ForeignFieldLookupComponent>,
                @Inject(MAT_DIALOG_DATA) public data: ForeignFieldLookupComponentData,
                formBuilder: FormBuilder,
                http: HttpClient) {

        this.form = formBuilder.group({query: []});
        this.cities$ = Observable.merge(
            this.form.valueChanges.pipe(
                map((val) => val.query),
                debounceTime(500),
            ),
            observableOf('')
        ).pipe(
            distinctUntilChanged(),
            // normally you would use a service here ...
            mergeMap((query) => http.get<any[]>(data.config.autocompleteUrl, {
                    params: {
                        query: query
                    }
                })
            )
        );
    }

    select(city: any) {
        const result: ForeignFieldLookupResult[] = [
            {
                formatted_value: city.name,
                key: city.id
            }
        ];
        this.dialogRef.close(result);
    }

    clear() {
        this.dialogRef.close([]);
    }
}`
        },
        {
            tab: 'SampleForeignSelectorComponent.html',
            text: `
Write a few letters of the city name and then select the city. 
You can also <button mat-button (click)="clear()">clear</button> the previous value:
<form [formGroup]="form">
    <mat-input-container>
        <input formControlName="query" matInput placeholder="City name filter">
    </mat-input-container>
</form>
<table *ngIf="cities$ | async; let cities" class="mat-table">
    <ng-container *ngFor="let city of cities">
        <tr>
            <td title="City name">{{ city.name }}</td>
            <td title="ZIP code">{{city.zipcode}}</td>
            <td rowspan="2">
                <button mat-button (click)="select(city)">Select this city</button>
            </td>
        </tr>
        <tr>
            <td colspan="2" title="comment">{{ city.comment }}</td>
        </tr>
    </ng-container>
</table>
`
        },
        {
            tab: 'app-module',
            text: `
@NgModule({
    declarations: [
        ...
        SampleForeignSelectorComponent,
    ],
    entryComponents: [
        SampleForeignSelectorComponent,
    ],
    providers: [
        {
            provide: FOREIGN_FIELD_LOOKUP_COMPONENT_PROVIDER,
            // NOTE: the dialog will instantiate the component, so needs to get the type, not instance
            // that's the reason for useValue with type as a value
            useValue: SampleForeignSelectorComponent
        },
    ]`
        },
        {
            tab: 'Response',
            text: ''
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }

    submit(data) {
        this.code.update('Response', data);
    }

    cancel(data) {
        this.code.update('Response', data);
    }
}
