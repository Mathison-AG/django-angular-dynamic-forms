import {Component, OnInit, ViewChild} from '@angular/core';
import {DjangoFormDialogService} from 'django-angular-dynamic-forms';
import {CodeSampleComponent} from '../code-sample/code-sample.component';

@Component({
    selector: 'app-create-custom-save',
    template: `
        <h1>Creating a new django object via custom save method</h1>

        <button mat-raised-button color="primary" (click)="click()">Click to create a new City via dialog</button>

        <code-sample [tabs]="tabs"></code-sample>
    `,
    styles: []
})
export class CreateCustomSaveComponent implements OnInit {

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
    this.dialog.open('/api/1.0/cities/', {
        formId: 'custom'
    }).subscribe(result => {
        console.log(result);
    });
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
        'custom': ['name']
    }

    # same parameters as django rest framework @action decorator
    @form_action(form_id='custom', detail=False, url_path='custom')
    def custom_form_action(self, request):
        if request.method == 'POST':
            request.data['zipcode'] = 'A10000'
            return super().create(request)
        else:
            raise Exception()
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

        this.dialog.open('/api/1.0/cities/', {
            formId: 'custom'
        }).subscribe(result => {
            this.code.update('response', result);
        });
    }
}
