import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSampleComponent} from '../code-sample/code-sample.component';
import {Router} from '@angular/router';

@Component({
    selector: 'app-edit-in-page',
    template: `

        <h1>Editing django object in page</h1>

        <router-outlet></router-outlet>

        <code-sample [tabs]="tabs"></code-sample>
    `,
    styles: []
})
export class EditInPageComponent implements OnInit {

    @ViewChild(CodeSampleComponent)
    code: CodeSampleComponent;

    tabs = [
        {
            tab: 'Router',
            text: `
    {
        path: 'edit-in-page',
        pathMatch: 'prefix',
        component: MainComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: TableComponent
            },
            {
                path: ':id',
                pathMatch: 'full',
                component: FormComponent
            },
        ]
    },            
            `
        },
        {

            tab: 'MainComponent',
            text: `
    finished(data) {
        this.code.update('response', data);
    }
`
        },
        {

            tab: 'MainComponent template',
            text: `
    <router-outlet></router-outlet>
`
        },
        {

            tab: 'TableComponent',
            text: `

    data = new MatTableDataSource();
    displayedColumns = ['name', 'zipcode', 'comment', 'actions'];

    constructor(private http: HttpClient, private errors: ErrorService,
                private router: Router, private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.reload();
    }

    public reload() {
        this.http.get<any>('/api/1.0/cities/')
            .catch(err => this.errors.showCommunicationError(err))
            .subscribe(resp => {
                this.data = new MatTableDataSource(resp);
            });
    }

    edit(id: string) {
        this.router.navigate([id], {
            relativeTo: this.route
        });
    }
`
        },
        {

            tab: 'TableComponent template',
            text: `
    <mat-table [dataSource]="data">
        <ng-container matColumnDef="name">
            <mat-header-cell *matHeaderCellDef>City</mat-header-cell>
            <mat-cell *matCellDef="let row"> {{ row.name }}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="zipcode">
            <mat-header-cell *matHeaderCellDef> ZIP code</mat-header-cell>
            <mat-cell *matCellDef="let row">{{row.zipcode}}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="comment">
            <mat-header-cell *matHeaderCellDef> Comment</mat-header-cell>
            <mat-cell *matCellDef="let row">{{row.comment}}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="actions">
            <mat-header-cell *matHeaderCellDef> Actions</mat-header-cell>
            <mat-cell *matCellDef="let row">
                <button mat-button color="primary" (click)="edit(row.id)">
                    <mat-icon>edit</mat-icon>
                </button>
            </mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>`
        },
        {

            tab: 'FormComponent',
            text: `

    url: string;

    constructor(private route: ActivatedRoute, private router: Router, @Optional() private parent: EditInPageComponent) {
    }

    ngOnInit() {
        this.url = \`/api/1.0/cities/\${this.route.snapshot.params.id}/\`;
    }

    submit(data) {
        this.parent.finished(data);
        this.router.navigate(['..'], {
            relativeTo: this.route
        });
    }

    cancel(data) {
        this.parent.finished(data);
        this.router.navigate(['..'], {
            relativeTo: this.route
        });
    }
`
        },
        {

            tab: 'FormComponent template',
            text: `
        <div class='bordered' fxFlex="50" fxFlex.sm="100">
            <django-inpage-form [djangoUrl]="url"
                                (submit)="submit($event)"
                                (cancel)="cancel($event)"></django-inpage-form>
        </div>
`
        },
        {

            tab: 'python',
            text: `
class City(models.Model):
    name = models.CharField(max_length=100)
    zipcode = models.CharField(max_length=20)
    comment = models.TextField(null=True, blank=True)
    
class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ('name', 'zipcode', 'comment', 'id')

class CityViewSet(AngularFormMixin, viewsets.ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = (permissions.AllowAny,)
            
router = DefaultRouter()
router.register(r'cities', CityViewSet)

urlpatterns = [
    url(r'^/api/1.0/', include(router.urls)),
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

    finished(data) {
        this.code.update('response', data);
    }

}
