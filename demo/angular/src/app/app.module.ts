import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {DjangoFormModule, ErrorService} from 'django-angular-dynamic-forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatSnackBarModule, MatTableModule,
    MatTabsModule
} from '@angular/material';
import {FlexLayoutModule} from '@angular/flex-layout';
import {AppRoutingModule} from './app-routing.module';
import {IntroComponent} from './intro/intro.component';
import {CreateViaDialogComponent} from './create-via-dialog/create-via-dialog.component';
import {HttpClientModule} from '@angular/common/http';
import {MatErrorService} from './mat-error.service';
import {HighlightJsModule, HighlightJsService} from 'angular2-highlight-js';
import {CodeSampleComponent} from './code-sample/code-sample.component';
import {CreateInPageComponent} from './create-in-page/create-in-page.component';
import {CreateViaDialogInitialDataComponent} from './create-via-dialog-initial-data/create-via-dialog-initial-data.component';
import { CreateInPageInitialDataComponent } from './create-in-page-initial-data/create-in-page-initial-data.component';
import { EditViaDialogComponent } from './edit-via-dialog/edit-via-dialog.component';
import { EditInPageComponent } from './edit-in-page/edit-in-page.component';
import { TableComponent } from './edit-in-page/table/table.component';
import { FormComponent } from './edit-in-page/form/form.component';
import { CreateViaDialogMultipleFormsComponent } from './create-via-dialog-multiple-forms/create-via-dialog-multiple-forms.component';
import { CreateInPageMultipleFormsComponent } from './create-in-page-multiple-forms/create-in-page-multiple-forms.component';


@NgModule({
    declarations: [
        AppComponent,
        IntroComponent,
        CreateViaDialogComponent,
        CodeSampleComponent,
        CreateInPageComponent,
        CreateViaDialogInitialDataComponent,
        CreateInPageInitialDataComponent,
        EditViaDialogComponent,
        EditInPageComponent,
        TableComponent,
        FormComponent,
        CreateViaDialogMultipleFormsComponent,
        CreateInPageMultipleFormsComponent
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
        MatTableModule,
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
