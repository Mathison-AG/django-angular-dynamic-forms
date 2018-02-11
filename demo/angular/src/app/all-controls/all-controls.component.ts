import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSampleComponent} from '../code-sample/code-sample.component';

@Component({
    selector: 'app-create-in-page',
    template: `
        <h1>Available form controls</h1>

        <div fxLayout="row">
            <div class='bordered' fxFlex="50" fxFlex.sm="100">
                <inpage-django-form django_url="/api/1.0/test/" (submit)="submit($event)"
                                    (cancel)="cancel($event)"></inpage-django-form>
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
export class AllControlsComponent implements OnInit {
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
class TestModel(models.Model):
    name = models.CharField(verbose_name='City autocomplete', max_length=10)
    radio = models.CharField(max_length=1, choices=(
        (1, "One"),
        (2, "Two"),
        (3, "Three")
    ))
    number = models.IntegerField(validators=[
            MaxValueValidator(100),
            MinValueValidator(0)
        ])
    checkbox = models.BooleanField()
    string = models.CharField(max_length=100)
    area = models.TextField()
    email = models.EmailField()


class TestModelViewSet(AutoCompleteMixin, AngularFormMixin, viewsets.ModelViewSet):
    """
    API for TestModel
    """
    queryset = TestModel.objects.all()
    serializer_class = TestModelSerializer
    permission_classes = (permissions.AllowAny,)

    form_layout = [
        AngularFormMixin.columns(
                [
                    AngularFormMixin.fieldset('Core text',
                                              [
                                                  'string',
                                                  'area',
                                              ]),
                    AngularFormMixin.fieldset('Checkboxes and Radio Buttons',
                                              [
                                                  'radio',
                                                  'checkbox'
                                              ])
                ],
                [
                    AngularFormMixin.fieldset('Input fields',
                                              [
                                                  'name',
                                                  'email',
                                                  'number'
                                              ])
                ]
        )
    ]

    @autocomplete(field='name', formatter='{{item.name}} [{{item.id}}]')
    def name_autocomplete(self, search):
        return City.objects.filter(name__istartswith=search).order_by('name')
    `
        },
        {
            tab: 'template',
            text: `
<div class='bordered' fxFlex="50" fxFlex.sm="100">
    <inpage-django-form django_url="/api/1.0/test/" 
                        (submit)="submit($event)" 
                        (cancel)="cancel($event)"></inpage-django-form>
</div>
    `
        },
        {
            tab: 'scss',
            text: `
.dadf-columns {
    display: flex;
    flex-wrap: nowrap;
    flex-flow: row;
    justify-content: space-around;
    align-items: flex-start;
}

.dadf-column-2 {
    flex: 1 1 50%;
}

label.dadf-fieldset {
    font-variant: small-caps;
}

.dadf-buttons {
    padding-top: 30px;

    button:not(:first-child) {
        margin-left: 20px;
    }
}
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
