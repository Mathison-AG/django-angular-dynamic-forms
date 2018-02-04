import {NgModule} from '@angular/core';


import {AppComponent} from './app.component';
import {DjangoFormModule, ErrorService} from '../django-form';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatSnackBarModule,
    MatTabsModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {AppRoutingModule} from './app-routing.module';
import { IntroComponent } from './intro/intro.component';
import { CreateViaDialogComponent } from './create-via-dialog/create-via-dialog.component';
import {HttpClientModule} from '@angular/common/http';
import {MatErrorService} from './mat-error.service';
import {HighlightJsModule, HighlightJsService} from 'angular2-highlight-js';


@NgModule({
    declarations: [
        AppComponent,
        IntroComponent,
        CreateViaDialogComponent
    ],
    imports: [
        BrowserAnimationsModule,
        DjangoFormModule,
        MatSidenavModule,
        MatIconModule,
        MatButtonModule,
        MatListModule,
        MatSnackBarModule,
        MatTabsModule,
        FlexLayoutModule,
        AppRoutingModule,
        HttpClientModule,
        HighlightJsModule
    ],
    providers: [
        {
            provide: ErrorService,
            useClass: MatErrorService
        },
        HighlightJsService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
