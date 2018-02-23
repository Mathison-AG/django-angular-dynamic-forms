import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-intro',
    template: `
        <h1>Welcome Django Rest Framework/Angular/Material form maker!</h1>
        Check one of the demos on the left.
    `,
    styles: []
})
export class IntroComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}
