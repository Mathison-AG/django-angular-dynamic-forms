import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSampleComponent} from '../code-sample/code-sample.component';
import {DjangoFormDialogService, ErrorService} from 'django-angular-dynamic-forms';
import {HttpClient} from '@angular/common/http';
import {catchError} from 'rxjs/operators';

@Component({
    selector: 'app-create-foreign',
    template: `
        <h1>Create and edit foreign key object</h1>

            <div *ngFor="let company of data">
                <h2>{{company.name}}</h2>
                <div><label>Contacts: </label></div>
                <table>
                    <tr *ngFor="let contact of company.contacts">
                        <td>{{contact.name}} ({{contact.email}})</td>
                        <td><button mat-button (click)="edit_contact(company, contact)"><mat-icon>edit</mat-icon> Edit</button></td>
                    </tr>
                </table>
                <button mat-raised-button (click)="add_contact(company)">Add a new contact</button>
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
export class CreateForeignComponent implements OnInit {
    @ViewChild(CodeSampleComponent)
    code: CodeSampleComponent;

    tabs = [
        {
            tab: 'Typescript',
            text: `
    constructor(private http: HttpClient,
                private errors: ErrorService,
                private dialog: DjangoFormDialogService) {
    }

    add_contact(company: any) {
        this.dialog.open(\`/api/1.0/companies/\${company.id}\`, {
            formId: 'new-contact'
        }).subscribe((result) => {
            console.log(result);
            this.code.update('Response', result);
            this.reload();
        });
    }

    edit_contact(company: any, contact: any) {
        this.dialog.open(\`/api/1.0/companies/\${company.id}\`, {
            formId: 'edit-contact',
            extraFormData: {
                contactId: contact.id
            }
        }).subscribe((result) => {
            console.log(result);
            this.code.update('Response', result);
            this.reload();
        });
    }

    ngOnInit() {
        this.reload();
    }

    reload() {
        this.http.get<any>('/api/1.0/companies/')
            .catch(err => this.errors.showCommunicationError(err))
            .subscribe(resp => {
                this.data = resp;
            });
    }
    `
        },
        {
            tab: 'Page Template',
            text: `

            <div *ngFor="let company of data">
                <h2>{{company.name}}</h2>
                <div><label>Contacts: </label></div>
                <table>
                    <tr *ngFor="let contact of company.contacts">
                        <td>{{contact.name}} ({{contact.email}})</td>
                        <td><button mat-button (click)="edit_contact(company, contact)"><mat-icon>edit</mat-icon> Edit</button></td>
                    </tr>
                </table>
                <button mat-raised-button (click)="add_contact(company)">Add a new contact</button>
            </div>
`
        },
        {
            tab: 'Python',
            text: `
class Company(models.Model):
    name = models.CharField(max_length=100)


class Contact(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='contacts')
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        exclude = ()


class ContactViewSet(AngularFormMixin, viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    form_layout = (
        'name', 'email'
    )


class CompanySerializer(serializers.ModelSerializer):

    contacts = ContactSerializer(many=True)

    class Meta:
        model = Company
        exclude = ()

# decorator is used to generate a @detail_route(...) def contact(...) that takes care of creating a new contact
@linked_forms()
class CompanyViewSet(AngularFormMixin, viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    linked_forms = {
        'new-contact': linked_form(ContactViewSet, link='company'),
        'edit-contact': linked_form(ContactViewSet, link='company', link_id='contactId')
    }

router = DefaultRouter()
router.register(r'companies', CompanyViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
]
`
        },
        {
            tab: 'Response',
            text: ''
        }
    ];

    public data: any;

    constructor(private http: HttpClient,
                private errors: ErrorService,
                private dialog: DjangoFormDialogService) {
    }

    ngOnInit() {
        this.reload();
    }

    reload() {
        this.http.get<any>('/api/1.0/companies/')
            .pipe(catchError(err => this.errors.showCommunicationError(err)))
            .subscribe(resp => {
                this.data = resp;
            });
    }

    add_contact(company: any) {
        this.dialog.open(`/api/1.0/companies/${company.id}`, {
            formId: 'new-contact'
        }).subscribe((result) => {
            console.log(result);
            this.code.update('Response', result);
            this.reload();
        });
    }

    edit_contact(company: any, contact: any) {
        this.dialog.open(`/api/1.0/companies/${company.id}`, {
            formId: 'edit-contact',
            extraFormData: {
                contactId: contact.id
            }
        }).subscribe((result) => {
            console.log(result);
            this.code.update('Response', result);
            this.reload();
        });
    }
}
