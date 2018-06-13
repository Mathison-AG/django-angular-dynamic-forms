import {Component, OnInit, Optional} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {EditInPageComponent} from '../edit-in-page.component';

@Component({
    selector: 'app-form',
    template: `
        <div class='bordered' fxFlex="50" fxFlex.sm="100">
            <django-inpage-form [djangoUrl]="url"
                                (submit)="submit($event)"
                                (cancel)="cancel($event)"></django-inpage-form>
        </div>
    `,
    styles: [`
        .bordered {
            border: 1px solid lightblue;
            padding: 20px;
        }
    `]
})
export class FormComponent implements OnInit {

    url: string;

    constructor(private route: ActivatedRoute, private router: Router, @Optional() private parent: EditInPageComponent) {
    }

    ngOnInit() {
        this.url = `/api/1.0/cities/${this.route.snapshot.params.id}/`;
    }

    submit(data) {
        this.parent.finished(data);
        this.router.navigate(['..'], {
            relativeTo: this.route
        });
    }

    cancel(data) {
        this.parent.finished(data);
        this.router.navigate(['..'], {
            relativeTo: this.route
        });
    }
}
