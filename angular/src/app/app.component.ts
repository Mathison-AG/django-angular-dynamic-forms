import {Component} from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
        <!--The content below is only a placeholder and can be replaced.-->
        <mat-sidenav-container class="sidenav-container"
                               [style.marginTop.px]="0">
            <mat-sidenav #left mode="side" [opened]="true" class="left-sidenav">
                <div class="left-sidenav-content">
                    <h1>Examples:</h1>
                    <mat-list>
                        <mat-list-item>
                            <a routerLink="/create-via-dialog">Create a new object via dialog</a>
                        </mat-list-item>
                        <mat-list-item>
                            <a routerLink="/create-in-page">Create a new object via in-page form</a>
                        </mat-list-item>
                        <mat-list-item>
                            <a>Create a new object in-page with dynamic configuration</a>
                        </mat-list-item>
                    </mat-list>
                </div>
            </mat-sidenav>
            <mat-sidenav-content>
                <router-outlet></router-outlet>
            </mat-sidenav-content>
        </mat-sidenav-container>
    `,
    styles: [`
        mat-sidenav {
            min-height: 100vh;
            width: 20vw;
            padding: 20px;
        }

        mat-sidenav-content {
            padding: 20px;
            min-height: 100vh;
            border-left: 1px solid lightgray;
        }
    `]
})
export class AppComponent {
    title = 'app';
}
