import {Component} from '@angular/core';
import {environment} from '../environments/environment';

@Component({
    selector: 'app-root',
    template: `
        <!--The content below is only a placeholder and can be replaced.-->
        <mat-sidenav-container class="sidenav-container"
                               [style.marginTop.px]="0">
            <mat-sidenav #left mode="side" [opened]="true" class="left-sidenav">
                <div class="left-sidenav-content">
                    <h2>Django-angular dialogs</h2>
                    <p>Rapid form library for Django Rest Framework and Angular 6.</p>
                    <p>Library version {{version}}.</p>
                    <mat-accordion>
                        <mat-expansion-panel>
                            <mat-expansion-panel-header>
                                <mat-panel-title>
                                    Creating objects
                                </mat-panel-title>
                            </mat-expansion-panel-header>
                            <a routerLink="/create-via-dialog">Create a new object via dialog</a>
                            <a routerLink="/create-in-page">Create a new object via in-page form</a>
                            <a routerLink="/create-custom-save">Create a new object with a custom save method</a>
                        </mat-expansion-panel>
                        <mat-expansion-panel>
                            <mat-expansion-panel-header>
                                <mat-panel-title>
                                    Creating objects with initial data
                                </mat-panel-title>
                            </mat-expansion-panel-header>
                            <a routerLink="/create-via-dialog-initial-data">Create a new object via dialog</a>
                            <a routerLink="/create-in-page-initial-data">Create a new object via in-page form</a>
                        </mat-expansion-panel>
                        <mat-expansion-panel>
                            <mat-expansion-panel-header>
                                <mat-panel-title>
                                    Editing objects
                                </mat-panel-title>
                            </mat-expansion-panel-header>
                            <a routerLink="/edit-via-dialog">Editing existing object via dialog</a>
                            <a routerLink="/edit-in-page">Editing existing object in-page</a>
                        </mat-expansion-panel>
                        <mat-expansion-panel>
                            <mat-expansion-panel-header>
                                <mat-panel-title>
                                    Multiple dialogs on the same viewset
                                </mat-panel-title>
                            </mat-expansion-panel-header>
                            <a routerLink="/create-via-dialog-multiple-forms">Multiple forms via dialog</a>
                            <a routerLink="/create-in-page-multiple-forms">Multiple forms via in-page form</a>
                        </mat-expansion-panel>
                        <mat-expansion-panel>
                            <mat-expansion-panel-header>
                                <mat-panel-title>
                                    Foreign keys and many-to-many
                                </mat-panel-title>
                            </mat-expansion-panel-header>
                            <a routerLink="/foreign">Foreign Key</a>
                            <a routerLink="/all-controls">m2m in All available controls and layout demo</a>
                            <a routerLink="/create-foreign">Create a new instance of referenced object</a>
                        </mat-expansion-panel>
                        <mat-expansion-panel>
                            <mat-expansion-panel-header>
                                <mat-panel-title>
                                    All controls and layout
                                </mat-panel-title>
                            </mat-expansion-panel-header>
                            <a routerLink="/all-controls">All available controls and layout</a>
                        </mat-expansion-panel>
                    </mat-accordion>
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

        mat-accordion {
            padding-top: 20px;
            display: block;
        }

        mat-accordion a {
            display: block;
            text-decoration: none;
            padding-bottom: 10px;
            margin-left: 20px;
        }
    `]
})
export class AppComponent {
    title = 'app';
    version = environment.version || "unknown";
}
