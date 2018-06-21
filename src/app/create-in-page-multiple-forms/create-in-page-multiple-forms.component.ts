import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSampleComponent} from '../code-sample/code-sample.component';

@Component({
    selector: 'app-create-in-page-multiple-forms',
    template: `
        <h1>Creating a new django object with several in-page forms on one viewset</h1>

        <div fxLayout="row">
            <div class='bordered' fxFlex="50" fxFlex.sm="100">
                <h2>Simplified form</h2>
                <django-inpage-form djangoUrl="/api/1.0/cities/" formId="simplified" (submit)="submit($event)"
                                    (cancel)="cancel($event)" (shown)="shown($event)"></django-inpage-form>
            </div>

            <div class='bordered' fxFlex="50" fxFlex.sm="100">
                <h2>Full form</h2>
                <django-inpage-form djangoUrl="/api/1.0/cities/" formId="full" (submit)="submit($event)"
                                    (cancel)="cancel($event)" (shown)="shown($event)"></django-inpage-form>
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
export class CreateInPageMultipleFormsComponent implements OnInit {
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
class CityViewSet(AngularFormMixin, viewsets.ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = (permissions.AllowAny,)

    form_layouts = {
        'full': ['name', 'zipcode', 'comment'],
        'simplified': ['name', 'zipcode']
    }
    `
        },
        {
            tab: 'template',
            text: `

    <django-inpage-form djangoUrl="/api/1.0/cities/" formId="simplified" (submit)="submit($event)"
                        (cancel)="cancel($event)" (shown)="shown($event)"></django-inpage-form>
    <django-inpage-form djangoUrl="/api/1.0/cities/" formId="full" (submit)="submit($event)"
                        (cancel)="cancel($event)" (shown)="shown($event)"></django-inpage-form>
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

    shown(data) {
        console.log('shown', data);
    }
}
