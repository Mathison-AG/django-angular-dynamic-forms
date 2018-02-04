import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DjangoFormDialogService} from '../../django-form';
import {MatTab, MatTabGroup} from '@angular/material';
import {HighlightJsService} from 'angular2-highlight-js';

@Component({
    selector: 'app-create-via-dialog',
    template: `
        <button mat-raised-button color="primary" (click)="click()">Click to create a new City via dialog</button>

        <mat-tab-group style="margin-top: 50px;" #group (selectedTabChange)="tabChange($event.index)">
            <mat-tab label="Angular">
                <div>
            <pre class="typescript">
constructor(private dialog: DjangoFormDialogService) {{ '{' }}
{{ '}' }}
click() {{ '{' }}
    // note: do not forget the trailing '/'
    this.dialog.open('/api/1.0/cities/').subscribe(result => {{ '{' }}
        console.log(result);
    {{ '}' }});
{{ '}' }}
        
        </pre>
                </div>
            </mat-tab>
            <mat-tab label="Python">
                <div>
            <pre class="python">
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
        </pre>
                </div>
            </mat-tab>
            <mat-tab label="Console.log(result)" [disabled]="!response" highlight-js-content=".highlight">
            <pre *ngIf="response" class="json" [innerHtml]="response | json">
            </pre>
            </mat-tab>
        </mat-tab-group>
    `,
    styles: []
})
export class CreateViaDialogComponent implements OnInit {

    response: any;

    @ViewChild('group')
    group: MatTabGroup;

    constructor(private dialog: DjangoFormDialogService,
                private el: ElementRef, private service : HighlightJsService) {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.service.highlight(this.el.nativeElement.querySelector('.typescript'));
    }

    click() {

        this.dialog.open('/api/1.0/cities/').subscribe(result => {
            this.response = result;
            setTimeout(() => {
                this.group.selectedIndex = 2;
                this.tabChange(2);
            });
        });
    }

    tabChange(index) {
        const selectors = [
            '.typescript', '.python', '.json'
        ];
        let el = this.el.nativeElement.querySelector(selectors[index]);
        if (el) {
            this.service.highlight(el);
        }
    }

}
