import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-intro',
    template: `
        <h1>Welcome Django Rest Framework/Angular/Material form maker!</h1>
        Quick setup:
        <ol>
            <li>
                <p>
                    Do not forget to start the angular server with proxy enabled:
                </p>
                <pre>
            ng serve --proxy-config proxy.conf.json</pre>
                <p>
                    and head to <a href="http://127.0.0.1:4200/">http://127.0.0.1:4200/</a> (do NOT use localhost
                    as the proxy will not work with localhost).
                </p>
            </li>
            <li>
                <p>
                    Start a sample django server at port 8000:
                </p>
                <pre>
            virtualenv --python3 /tmp/venv
            source /tmp/venv/bin/activate
            pip install Django djangorestframework
            cd sample-app
            python manage.py migrate
            python manage.py runserver</pre>
            </li>
            <li>
                Check that API is online by opening 
                <a href="http://127.0.0.1:4200/api/1.0/" target="_blank">http://127.0.0.1:4200/api/1.0/</a>
                in a new tab.
            </li>
            <li>
                Select one of the examples in the left tab
            </li>
        </ol>
    `,
    styles: []
})
export class IntroComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}
