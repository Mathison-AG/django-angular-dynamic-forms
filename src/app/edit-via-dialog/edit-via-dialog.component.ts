import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {DjangoFormDialogService, ErrorService} from 'django-angular-dynamic-forms';
import {CodeSampleComponent} from '../code-sample/code-sample.component';
import {catchError} from 'rxjs/operators';

@Component({
    selector: 'app-edit-via-dialog',
    template: `
        <h1>Editing django object via popup dialog</h1>

        <p>
            At first run any of the "create" examples to have data in this table.
        </p>

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
        </mat-table>

        <code-sample [tabs]="tabs"></code-sample>
    `,
    styles: []
})
export class EditViaDialogComponent implements OnInit {

    data = new MatTableDataSource();
    displayedColumns = ['name', 'zipcode', 'comment', 'actions'];

    @ViewChild(CodeSampleComponent)
    code: CodeSampleComponent;

    tabs = [
        {
            tab: 'typescript',
            text: `

    data = new MatTableDataSource();
    displayedColumns = ['name', 'zipcode', 'comment', 'actions'];

    constructor(private http: HttpClient, private errors: ErrorService,
                private dialog: DjangoFormDialogService)
    {
    }

    ngOnInit() {
        this.reload();
    }

    reload() {
        this.http.get<any>('/api/1.0/cities/')
            .catch(err => this.errors.showCommunicationError(err))
            .subscribe(resp=>{
                this.data = new MatTableDataSource(resp);
            })
    }

    edit(id: string) {
        this.dialog.open(\`/api/1.0/cities/$\{id\}/\`).subscribe(result => {
            this.reload();
        });
    }
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
]
    `
        },
        {
            tab: 'template',
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
                <mat-cell *matCellDef="let row"><button mat-button color="primary" (click)="edit(row.id)">
                    <mat-icon>edit</mat-icon></button></mat-cell>
            </ng-container>

            <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
            <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
        </mat-table>
    `
        },
        {
            tab: 'response',
            text: ''
        }
    ];

    constructor(private http: HttpClient, private errors: ErrorService,
                private dialog: DjangoFormDialogService) {
    }

    ngOnInit() {
        this.reload();
    }

    reload() {
        this.http.get<any>('/api/1.0/cities/')
            .pipe(catchError(err => this.errors.showCommunicationError(err)))
            .subscribe(resp => {
                this.data = new MatTableDataSource(resp);
            });
    }

    edit(id: string) {
        this.dialog.open(`/api/1.0/cities/${id}/`).subscribe(result => {
            this.reload();
            this.code.update('response', result);
        });
    }

}
