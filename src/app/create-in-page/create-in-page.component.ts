import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSampleComponent} from '../code-sample/code-sample.component';

@Component({
    selector: 'app-create-in-page',
    template: `
        <h1>Creating a new django object with an in-page form</h1>

        <div fxLayout="row">
            <div class='bordered' fxFlex="50" fxFlex.sm="100">
                <django-inpage-form djangoUrl="/api/1.0/cities/" (submit)="submit($event)"
                                    (cancel)="cancel($event)"></django-inpage-form>
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
export class CreateInPageComponent implements OnInit {
    @ViewChild(CodeSampleComponent)
    code: CodeSampleComponent;

    tabs = [
        {
            tab: 'typescript',
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
<div class='bordered' fxFlex="50" fxFlex.sm="100">
    <django-inpage-form djangoUrl="/api/1.0/cities/" 
                        (submit)="submit($event)" 
                        (cancel)="cancel($event)"></django-inpage-form>
</div>
    `
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
}
