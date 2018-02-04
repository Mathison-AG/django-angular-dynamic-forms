import {Component, OnInit} from '@angular/core';
import {Subject} from 'rxjs/Subject';

@Component({
    selector: 'app-create-in-page',
    template: `
        <h1>Creating a new django object with an in-page form</h1>

        <div fxLayout="row">
            <div class='bordered' fxFlex="50" fxFlex.sm="100">
                <inpage-django-form django_url="/api/1.0/cities/" (submit)="submit($event)" (cancel)="cancel($event)"></inpage-django-form>
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
export class CreateInPageComponent implements OnInit {

    typescript = `
    submit(data) {
        console.log('Saved, got response', data);
    }

    cancel(data) {
        console.log('cancelled, form data', data);
    }
    `;
    python = `
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
    template = `
<div class='bordered' fxFlex="50" fxFlex.sm="100">
    <inpage-django-form django_url="/api/1.0/cities/" 
                        (submit)="submit($event)" 
                        (cancel)="cancel($event)"></inpage-django-form>
</div>
    `;
    response = '';

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
