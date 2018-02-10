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
                    <h2>Creating objects</h2>
                    <mat-list>
                        <mat-list-item>
                            <a routerLink="/create-via-dialog">Create a new object via dialog</a>
                        </mat-list-item>
                        <mat-list-item>
                            <a routerLink="/create-in-page">Create a new object via in-page form</a>
                        </mat-list-item>
                        <!-- mat-list-item>
                            <a>Create a new object in-page with dynamic configuration</a>
                        </mat-list-item -->
                    </mat-list>
                    <h2>Creating objects with initial data</h2>
                    <mat-list>
                        <mat-list-item>
                            <a routerLink="/create-via-dialog-initial-data">Create a new object via dialog</a>
                        </mat-list-item>
                        <mat-list-item>
                            <a routerLink="/create-in-page-initial-data">Create a new object via in-page form</a>
                        </mat-list-item>
                    </mat-list>
                    <h2>Editing objects</h2>
                    <mat-list>
                        <mat-list-item>
                            <a routerLink="/edit-via-dialog">Editing existing object via dialog</a>
                        </mat-list-item>
                        <mat-list-item>
                            <a routerLink="/edit-in-page">Editing existing object in-page</a>
                        </mat-list-item>
                        <!-- mat-list-item>
                            <a>Create a new object in-page with dynamic configuration</a>
                        </mat-list-item -->
                    </mat-list>
                    <h2>Multiple dialogs on the same viewset</h2>
                    <mat-list>
                        <mat-list-item>
                            <a routerLink="/create-via-dialog-multiple-forms">Multiple forms via dialog</a>
                        </mat-list-item>
                        <mat-list-item>
                            <a routerLink="/create-in-page-multiple-forms">Multiple forms via in-page form</a>
                        </mat-list-item>
                        <!-- mat-list-item>
                            <a>Create a new object in-page with dynamic configuration</a>
                        </mat-list-item -->
                    </mat-list>
                    <h2>Available controls</h2>
                    <mat-list>
                        <mat-list-item>
                            <a routerLink="/all-controls">Edit page with all available controls</a>
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
        
        h2 {
            padding-bottom: 0;
            margin-bottom: 0;
            margin-top: 10px;
        }
        
        mat-list {
            padding-top: 0;
        }
    `]
})
export class AppComponent {
    title = 'app';
}
