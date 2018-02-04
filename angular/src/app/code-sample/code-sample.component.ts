import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {MatTabGroup} from '@angular/material';
import {HighlightJsService} from 'angular2-highlight-js';

@Component({
    selector: 'code-sample',
    template: `
        <mat-tab-group style="margin-top: 50px;" #group (selectedTabChange)="tabChange($event.index)">
            <mat-tab label="Angular">
                <div>
                    <pre class="typescript" [innerHtml]="">{{typescript}}</pre>
                </div>
            </mat-tab>
            <mat-tab label="HTML Template">
                <div>
                    <pre class="template">{{template}}</pre>
                </div>
            </mat-tab>
            <mat-tab label="Python">
                <div>
                    <pre class="python">{{python}}</pre>
                </div>
            </mat-tab>
            <mat-tab label="Console.log(result)" [disabled]="!_response || !_response[0]" highlight-js-content=".highlight">
                <pre *ngFor="let resp of _response" class="json">{{resp | json}}</pre>
            </mat-tab>
        </mat-tab-group>
    `,
    styles: []
})
export class CodeSampleComponent implements AfterViewInit {

    @ViewChild('group')
    group: MatTabGroup;


    @Input()
    typescript: string;

    @Input()
    python: string;

    @Input()
    template: string;

    _response: string[];

    @Input()
    set response(value: string) {
        this._response = [value];
        if (value) {
            setTimeout(() => {
                this.group.selectedIndex = 3;
                this.tabChange(3);
            });
        }
    }

    constructor(private el: ElementRef, private service: HighlightJsService) {
    }

    ngAfterViewInit(): void {
        this.tabChange(0);
    }

    tabChange(index) {
        const selectors = [
            '.typescript', '.template', '.python', '.json'
        ];
        let el = this.el.nativeElement.querySelector(selectors[index]);
        if (el) {
            this.service.highlight(el);
        }
    }
}
