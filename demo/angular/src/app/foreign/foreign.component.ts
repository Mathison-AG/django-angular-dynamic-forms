import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSampleComponent} from '../code-sample/code-sample.component';

@Component({
    selector: 'app-create-in-page',
    template: `
        <h1>Reference to foreign key</h1>

        <div fxLayout="row">
            <div class='bordered' fxFlex="50" fxFlex.sm="100">
                <inpage-django-form djangoUrl="/api/1.0/addresses/" (submit)="submit($event)"
                                    (cancel)="cancel($event)">
                </inpage-django-form>
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
export class ForeignComponent implements OnInit {
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
            text: ``
        },
        {
            tab: 'template',
            text: `
<div class='bordered' fxFlex="50" fxFlex.sm="100">
    <inpage-django-form djangoUrl="/api/1.0/addresses/" 
                        (submit)="submit($event)" 
                        (cancel)="cancel($event)"></inpage-django-form>
</div>`
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
