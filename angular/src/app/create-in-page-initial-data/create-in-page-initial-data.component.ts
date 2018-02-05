import {Component, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {DjangoFormConfig} from '../../django-form/django-form-iface';

@Component({
    selector: 'app-create-in-page',
    template: `
        <h1>Creating a new django object with an in-page form with fields pre-filled</h1>

        <div fxLayout="row">
            <div class='bordered' fxFlex="50" fxFlex.sm="100">
                <inpage-django-form django_url="/api/1.0/cities/" 
                                    [extra_config] = 'config'
                                    (submit)="submit($event)" (cancel)="cancel($event)"></inpage-django-form>
            </div>
        </div>

        <code-sample [typescript]="typescript" [template]="template" [python]="python" [response]="response"></code-sample>
    `,
    styles: [`
        .bordered {
            border: 1px solid lightblue;
            padding: 20px;
        }
    `]
})
export class CreateInPageInitialDataComponent implements OnInit {

    typescript = `

    config : DjangoFormConfig = {
        initial_data: {
            name: 'Prague'
        }
    };

    submit(data) {
        console.log('Saved, got response', data);
    }

    cancel(data) {
        console.log('cancelled, form data', data);
    }
    `;
    python = `
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
    `;
    template = `
<div class='bordered' fxFlex="50" fxFlex.sm="100">
    <inpage-django-form django_url="/api/1.0/cities/" 
                        [extra_config] = 'config'
                        (submit)="submit($event)" 
                        (cancel)="cancel($event)"></inpage-django-form>
</div>
    `;
    response = '';

    config : DjangoFormConfig = {
        initial_data: {
            name: 'Prague'
        }
    };

    constructor() {
    }

    ngOnInit() {
    }

    submit(data) {
        this.response = data;
    }

    cancel(data) {
        this.response = data;
    }
}
