import {Component, OnInit} from '@angular/core';
import {DjangoFormDialogService} from '../../django-form';

@Component({
    selector: 'app-create-via-dialog',
    template: `
        <h1>Creating a new django object via popup dialog</h1>
        
        <button mat-raised-button color="primary" (click)="click()">Click to create a new City via dialog</button>

        <code-sample [typescript]="typescript" [python]="python" [template]="template" [response]="response"></code-sample>
    `,
    styles: []
})
export class CreateViaDialogComponent implements OnInit {

    typescript=`
constructor(private dialog: DjangoFormDialogService) {
}
click() {
    // note: do not forget the trailing '/'
    this.dialog.open('/api/1.0/cities/').subscribe(result => {
        console.log(result);
    });
}
`;

    python=`
class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ('name',)

class CityViewSet(AngularFormMixin, viewsets.ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = (permissions.AllowAny,)
            
router = DefaultRouter()
router.register(r'cities', CityViewSet)

urlpatterns = [
    url(r'^/api/1.0/', include(router.urls)),
]
    `;

    template = `<button mat-raised-button color="primary" (click)="click()">Click to create a new City via dialog</button>`;

    response: any;

    constructor(private dialog: DjangoFormDialogService) {
    }

    ngOnInit() {
    }

    click() {

        this.dialog.open('/api/1.0/cities/').subscribe(result => {
            this.response = result;
        });
    }
}
