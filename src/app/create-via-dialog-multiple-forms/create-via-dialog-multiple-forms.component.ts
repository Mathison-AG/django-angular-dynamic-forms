import {Component, OnInit, ViewChild} from '@angular/core';
import {DjangoFormDialogService} from 'django-angular-dynamic-forms';
import {CodeSampleComponent} from '../code-sample/code-sample.component';

@Component({
    selector: 'app-create-via-dialog',
    template: `
        <h1>Creating a new django object via popup dialog - multiple forms on a viewset</h1>

        <button mat-raised-button color="primary" (click)="click('simplified')">Click to create a new City via simplified dialog</button>
        <button mat-raised-button color="primary" (click)="click('full')">Click to create a new City via full dialog</button>

        <code-sample [tabs]="tabs"></code-sample>
    `,
    styles: []
})
export class CreateViaDialogMultipleFormsComponent implements OnInit {

    @ViewChild(CodeSampleComponent)
    code: CodeSampleComponent;

    tabs = [
        {
            tab: 'typescript',
            text: `
constructor(private dialog: DjangoFormDialogService) {
}
click(formId: string) {
    this.dialog.open('/api/1.0/cities/', {
        formId: formId
    }).subscribe(result => {
        this.code.update('response', result);
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
        'full': ['name', 'zipcode', 'comment'],
        'simplified': ['name', 'zipcode']
    }

    `
        },
        {
            tab: 'template',
            text: `
        <button mat-raised-button color="primary" (click)="click('simplified')">Click to create a new City via simplified dialog</button>
        <button mat-raised-button color="primary" (click)="click('full')">Click to create a new City via full dialog</button>
`
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

    click(formId: string) {

        this.dialog.open('/api/1.0/cities/', {
            formId: formId
        }).subscribe(result => {
            this.code.update('response', result);
        });
    }
}
