import {Component, OnInit, ViewChild} from '@angular/core';
import {DjangoFormDialogService} from 'django-angular-dynamic-forms';
import {CodeSampleComponent} from '../code-sample/code-sample.component';

@Component({
    selector: 'app-create-via-dialog',
    template: `
        <h1>Creating a new django object via popup dialog</h1>

        <button mat-raised-button color="primary" (click)="click()">Click to create a new City via dialog</button>

        <code-sample [tabs]="tabs"></code-sample>
    `,
    styles: []
})
export class CreateViaDialogComponent implements OnInit {

    @ViewChild(CodeSampleComponent)
    code: CodeSampleComponent;

    tabs = [
        {
            tab: 'typescript',
            text: `
constructor(private dialog: DjangoFormDialogService) {
}
click() {
    // note: do not forget the trailing '/'
    this.dialog.open('/api/1.0/cities/').subscribe(result => {
        console.log(result);
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
            text: `<button mat-raised-button color="primary" (click)="click()">Click to create a new City via dialog</button>`
        },
        {
            tab: 'response',
            text: ''
        }
    ];

    constructor(private dialog: DjangoFormDialogService) {
    }

    ngOnInit() {
    }

    click() {

        this.dialog.open('/api/1.0/cities/').subscribe(result => {
            this.code.update('response', result);
        });
    }
}
