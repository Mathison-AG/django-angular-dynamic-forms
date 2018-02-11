import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {MatTabGroup} from '@angular/material';
import {HighlightJsService} from 'angular2-highlight-js';

@Component({
    selector: 'code-sample',
    template: `
        <mat-tab-group style="margin-top: 50px;" #group (selectedTabChange)="tabChange($event.index)">
            
            <mat-tab [label]="tab.tab" *ngFor="let tab of tabs">
                <div>
                    <pre [ngClass]="replaceSpaces(tab.tab)" [innerHtml]="">{{tab.text}}</pre>
                </div>
            </mat-tab>
        </mat-tab-group>
    `,
    styles: []
})
export class CodeSampleComponent implements AfterViewInit {

    @ViewChild('group')
    group: MatTabGroup;

    @Input()
    tabs: { tab: string, text: string }[];

    constructor(private el: ElementRef, private service: HighlightJsService) {
    }

    ngAfterViewInit(): void {
        this.tabChange(0);
    }

    tabChange(index) {
        let el = this.el.nativeElement.querySelector(`.${this.replaceSpaces(this.tabs[index].tab)}`);
        if (el) {
            this.service.highlight(el);
        }
    }

    update(tab : string, value: any) {
        value = JSON.stringify(value, null, 4);
        const tabIndex = this.tabs.findIndex(x => x.tab==tab);
        this.tabs[tabIndex] = {tab: tab, text: value};
        this.tabChange(tabIndex);
        this.group.selectedIndex = tabIndex;
    }

    replaceSpaces(x) {
        return x.replace(' ', '_');
    }
}
