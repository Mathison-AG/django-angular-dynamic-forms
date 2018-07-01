import {AfterViewInit, Component, Inject, Injectable, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CodeSampleComponent} from '../code-sample/code-sample.component';
import {
    MAT_DIALOG_DATA, MatDialogRef, MatPaginator, MatSort, MatTableDataSource, PageEvent,
    Sort
} from '@angular/material';
import {debounceTime, distinctUntilChanged, map, mergeMap} from 'rxjs/operators';
import {FormBuilder, FormGroup} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ForeignSelectorComponent} from './foreign-selector.component';
import {Observable, Subscription, of as observableOf, combineLatest} from 'rxjs';
import {ForeignSelectorFactoryService} from './foreign-selector-factory.service';
import {TagSelectorComponent} from './tag-selector.component';
import {
    FOREIGN_FIELD_FORMATTER_PROVIDER, ForeignFieldFormatter,
    ForeignFieldLookupConfig
} from 'django-angular-dynamic-forms';
import {SimpleForeignFieldFormatter} from '../app.module';

@Component({
    selector: 'app-create-in-page',
    template: `
        <h1>Available form controls</h1>

        <div fxLayout="row">
            <div class='bordered' fxFlex="50" fxFlex.sm="100">
                <django-inpage-form djangoUrl="/api/1.0/test/1/" (submit)="submit($event)"
                                    (cancel)="cancel($event)"
                                    (valueChanged)="valueChanged($event)"></django-inpage-form>
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
export class AllControlsComponent implements OnInit {
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
            tab: 'Python',
            text: `
class Tag(models.Model):
    name = models.CharField(max_length=20)

class TestModel(models.Model):
    name = models.CharField(verbose_name='City autocomplete', max_length=10)
    radio = models.CharField(max_length=1, choices=(
        (1, "One"),
        (2, "Two"),
        (3, "Three")
    ))
    number = models.IntegerField(validators=[
            MaxValueValidator(100),
            MinValueValidator(0)
        ])
    checkbox = models.BooleanField()
    string = models.CharField(max_length=100)
    area = models.TextField()
    email = models.EmailField()
    foreign_key = models.ForeignKey(City, null=True, blank=True, on_delete=models.CASCADE)
    tags = models.ManyToManyField(Tag, related_name='+', blank=True, verbose_name='Tags (many to many field)')

# ForeignSerializerMixin - when tags arrive from client, it converts them back to Tag instances
class TagSerializer(ForeignSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Tag
        exclude = ()


# ForeignSerializerMixin - patches the "update" method to handle tags. Alternatively provide your
# own update method
class TestModelSerializer(ForeignSerializerMixin, serializers.ModelSerializer):
    tags = TagSerializer(many=True)
    foreign_key = CitySerializer()

    class Meta:
        model = TestModel
        exclude = ()


class TestModelViewSet(ForeignFieldAutoCompleteMixin, AutoCompleteMixin, AngularFormMixin, viewsets.ModelViewSet):
    """
    API for TestModel
    """
    queryset = TestModel.objects.all()
    serializer_class = TestModelSerializer
    permission_classes = (permissions.AllowAny,)

    form_layout = [
        AngularFormMixin.columns(
            [
                AngularFormMixin.fieldset('Core text',
                                          [
                                              'string',
                                              'area',
                                          ]),
                AngularFormMixin.fieldset('Checkboxes and Radio Buttons',
                                          [
                                              'radio',
                                              'checkbox'
                                          ])
            ],
            [
                AngularFormMixin.fieldset('Input fields',
                                          [
                                              'name',
                                              'email',
                                              'number',
                                              'foreign_key',
                                              'tags'
                                          ])
            ]
        )
    ]
    form_defaults = {
        'foreign_key': {
            'something_extra': '123'
        }
    }

    @autocomplete(field='name', formatter='{{item.name}} [{{item.id}}]')
    def name_autocomplete(self, search):
        return City.objects.filter(name__istartswith=search).order_by('name')

    @foreign_field_autocomplete(field='foreign_key', serializer=CitySerializer, pagination=True)
    def city_autocomplete(self, request):
        query = request.GET.get('query')
        qs = City.objects.all().order_by('name')
        if query:
            qs = qs.filter(name__icontains=query)
        # TODO: handle sortBy and sortDirection GET parameters here
        return qs

    @foreign_field_autocomplete(field='tags', serializer=TagSerializer)
    def tags_autocomplete(self, request):
        # sample implementation, just return all tags. In a real-world example some filtering should
        # be here
        return Tag.objects.order_by('name')
    `
        },
        {
            tab: 'Template',
            text: `
<div class='bordered' fxFlex="50" fxFlex.sm="100">
    <django-inpage-form djangoUrl="/api/1.0/test/"
                        (submit)="submit($event)"
                        (cancel)="cancel($event)"></django-inpage-form>
</div>
`
        },
        {
            tab: 'SCSS',
            text: `
.dadf-columns {
    display: flex;
    flex-wrap: nowrap;
    flex-flow: row;
    justify-content: space-around;
    align-items: flex-start;
}

.dadf-column-2 {
    flex: 1 1 50%;
}

label.dadf-fieldset {
    font-variant: small-caps;
}

.dadf-buttons {
    padding-top: 30px;

    button:not(:first-child) {
        margin-left: 20px;
    }
}
    `
        },
        {
            tab: 'ForeignSelectorComponent.ts',
            text: `
export class ForeignSelectorComponent implements ForeignFieldLookupComponent, AfterViewInit, OnDestroy {
    public form: FormGroup;
    public displayedColumns = ['name', 'zipcode', 'comment', 'action'];
    public dataSource = new MatTableDataSource<any>([]);
    public itemCount = 0;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    private subscription: Subscription;


    constructor(public dialogRef: MatDialogRef<ForeignFieldLookupComponent>,
                @Inject(MAT_DIALOG_DATA) public data: ForeignFieldLookupComponentData,
                formBuilder: FormBuilder,
                private http: HttpClient) {

        this.form = formBuilder.group({query: []});
    }

    ngAfterViewInit(): void {

        const filter$ = Observable.merge(
            this.form.valueChanges.pipe(
                map((val) => val.query),
                debounceTime(500),
            ),
            observableOf('')
        );

        const paginator$ = Observable.merge(
            this.paginator.page,
            // default
            observableOf({
                pageIndex: 0,
                pageSize: 5
            })) as Observable<PageEvent>;

        const sort$ = Observable.merge(
            this.sort.sortChange,
            // default
            observableOf({
                active: '',
                direction: ''
            })) as Observable<Sort>;

        this.subscription = combineLatest(filter$, paginator$, sort$).pipe(
            distinctUntilChanged(),
            map((x) => ({
                filter: x[0],
                paginator: x[1],
                sort: x[2]
            })),
            // normally you would use a service here ...
            mergeMap((opts) => this.http.get<any>(this.data.config.autocompleteUrl, {
                    params: {
                        query: opts.filter,
                        pageIndex: opts.paginator.pageIndex.toString(),
                        pageSize: opts.paginator.pageSize.toString(),
                        sortBy: opts.sort.active,
                        sortDirection: opts.sort.direction
                    }
                })
            )
        ).subscribe((cities) => {
            this.dataSource = new MatTableDataSource<any>(cities.items);
            this.itemCount = cities.length;
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    select(city: any) {
        this.dialogRef.close([city]);
    }

    clear() {
        this.dialogRef.close([]);
    }
}`
        },
        {
            tab: 'ForeignSelectorComponent.html',
            text: `Write a few letters of the city name and then select the city.
    You can also
    <button mat-button (click)="clear()">clear</button> the previous value:

    <mat-table [dataSource]="dataSource" matSort>

        <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef mat-sort-header>
                <form [formGroup]="form">
                    <mat-form-field>
                        <input formControlName="query" matInput placeholder="City name filter">
                    </mat-form-field>
                </form>
            </mat-header-cell>
            <mat-cell *matCellDef="let row"> {{row.name}}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="zipcode">
            <mat-header-cell *matHeaderCellDef mat-sort-header> ZIP Code</mat-header-cell>
            <mat-cell *matCellDef="let row"> {{row.zipcode}}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="comment">
            <mat-header-cell *matHeaderCellDef mat-sort-header> Comment</mat-header-cell>
            <mat-cell *matCellDef="let row"> {{row.comment}}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="action">
            <mat-header-cell *matHeaderCellDef mat-sort-header></mat-header-cell>
            <mat-cell *matCellDef="let row">
                <button mat-button (click)="select(row)">select this</button>
            </mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: displayedColumns;">
        </mat-row>
    </mat-table>

    <mat-paginator [pageSizeOptions]="[5, 10]" [length]="itemCount"></mat-paginator>`
        },
        {
            tab: 'TagSelectorComponent',
            text: `
@Component({
    template:
            \`
        <p>Toggle the tags and click "Save" to remember your selection:</p>

        <div *ngFor="let tag of tags">
            <mat-slide-toggle [(ngModel)]="tag.selected">{{tag.name}}</mat-slide-toggle>
        </div>

        <button mat-button (click)="save()">Save</button>
    \`,
})
export class TagSelectorComponent implements ForeignFieldLookupComponent, AfterViewInit {

    public tags: any[] = [];

    constructor(public dialogRef: MatDialogRef<ForeignFieldLookupComponent>,
                @Inject(MAT_DIALOG_DATA) public data: ForeignFieldLookupComponentData,
                private http: HttpClient) {
    }

    ngAfterViewInit(): void {
        this.http.get<any>(this.data.config.autocompleteUrl).subscribe((tags) => {
            this.tags = tags.map((tag) => ({
                ...tag,
                selected: this.data.initialValue.some((t) => tag.id === t.id)
            }));
        });
    }

    save() {
        const result = this.tags.filter((tag) => tag.selected);
        this.dialogRef.close(result);
    }
}
`
        },
        {
            tab: 'ForeignSelectorFactoryService',
            text: `
/**
 * If you need different selection components for different fields, create and register a
 * factory service that returns the component class. The lookup config comes from django,
 * if you need to specify extra params to help here with component selection, do that in django's
 * form_defaults - see python code.
 */
@Injectable()
export class ForeignSelectorFactoryService implements ForeignFieldLookupFactory {
    constructor() {
    }
    public getComponent(lookupConfig: any): Type<ForeignFieldLookupComponent> {
        console.log('something extra:', lookupConfig.something_extra);
        if (lookupConfig.id === 'foreign_key') {
            return ForeignSelectorComponent;
        }
        if (lookupConfig.id === 'tags') {
            return TagSelectorComponent;
        }
        // if undefined is returned, the framework will try to get FOREIGN_FIELD_LOOKUP_COMPONENT_PROVIDER.
        // If that is not registered, an error will be thrown.
        return undefined;
    }
}`
        },
        {
            tab: 'app-module',
            text: `
@Injectable()
export class SimpleForeignFieldFormatter implements ForeignFieldFormatter {
    public format(config: ForeignFieldLookupConfig, value: any) {
        if (value.name) {
            return value.name;
        }
        return JSON.stringify(value);
    }
}

@NgModule({
    declarations: [
        ...
        ForeignSelectorComponent,
    ],
    entryComponents: [
        ForeignSelectorComponent,
    ],
    providers: [
        {
            provide: FOREIGN_FIELD_LOOKUP_FACTORY_PROVIDER,
            useClass: ForeignSelectorFactoryService
        },
        {
            provide: FOREIGN_FIELD_FORMATTER_PROVIDER,
            useClass: SimpleForeignFieldFormatter
        }
    ]`
        },
        {
            tab: 'response',
            text: ''
        }
    ];

    constructor() {
    }

    ngOnInit() {
    }

    submit(data) {
        this.code.update('response', data);
    }

    cancel(data) {
        this.code.update('response', data);
    }

    valueChanged(data) {
        console.log('Value changed', data);
    }
}
