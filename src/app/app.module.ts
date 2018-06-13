import {Injectable, NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {
    DjangoFormModule, ErrorService,
    ForeignFieldFormatter,
    FOREIGN_FIELD_LOOKUP_COMPONENT_PROVIDER,
    FOREIGN_FIELD_LOOKUP_FACTORY_PROVIDER,
    FOREIGN_FIELD_FORMATTER_PROVIDER,
    ForeignFieldLookupConfig
} from 'django-angular-dynamic-forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MatButtonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
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
import {CreateInPageInitialDataComponent} from './create-in-page-initial-data/create-in-page-initial-data.component';
import {EditViaDialogComponent} from './edit-via-dialog/edit-via-dialog.component';
import {EditInPageComponent} from './edit-in-page/edit-in-page.component';
import {TableComponent} from './edit-in-page/table/table.component';
import {FormComponent} from './edit-in-page/form/form.component';
import {CreateViaDialogMultipleFormsComponent} from './create-via-dialog-multiple-forms/create-via-dialog-multiple-forms.component';
import {CreateInPageMultipleFormsComponent} from './create-in-page-multiple-forms/create-in-page-multiple-forms.component';
import {AllControlsComponent} from './all-controls/all-controls.component';
import {DynamicFormsCoreModule} from '@ng-dynamic-forms/core';
import {DynamicFormsMaterialUIModule} from '@ng-dynamic-forms/ui-material';
import {ForeignComponent} from './foreign/foreign.component';
import {SampleForeignSelectorComponent} from './foreign/sample-foreign-selector.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ForeignSelectorFactoryService} from './all-controls/foreign-selector-factory.service';
import {ForeignSelectorComponent} from './all-controls/foreign-selector.component';
import {TagSelectorComponent} from './all-controls/tag-selector.component';
import { CreateForeignComponent } from './create-foreign/create-foreign.component';
import {CreateCustomSaveComponent} from './create-custom-save/create-custom-save.component';


@Injectable()
export class SimpleForeignFieldFormatter implements ForeignFieldFormatter {

    public format(config: ForeignFieldLookupConfig, value: any) {
        if (value.name) {
            return value.name;
        }
        return JSON.stringify(value);
    }
}


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
        CreateInPageMultipleFormsComponent,
        AllControlsComponent,
        ForeignComponent,
        SampleForeignSelectorComponent,
        ForeignSelectorComponent,
        TagSelectorComponent,
        CreateForeignComponent,
        CreateCustomSaveComponent
    ],
    imports: [
        BrowserAnimationsModule,
        DynamicFormsCoreModule.forRoot(),
        DynamicFormsMaterialUIModule,
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
        HighlightJsModule,
        MatExpansionModule,
        MatInputModule,
        ReactiveFormsModule,
        MatPaginatorModule,
        MatSortModule,
        MatSliderModule,
        MatSlideToggleModule,
        FormsModule,
        MatFormFieldModule
    ],
    providers: [
        {
            provide: ErrorService,
            useClass: MatErrorService
        },
        HighlightJsService,
        {
            provide: FOREIGN_FIELD_LOOKUP_COMPONENT_PROVIDER,
            useValue: SampleForeignSelectorComponent
        },
        {
            provide: FOREIGN_FIELD_LOOKUP_FACTORY_PROVIDER,
            useClass: ForeignSelectorFactoryService
        },
        {
            provide: FOREIGN_FIELD_FORMATTER_PROVIDER,
            useClass: SimpleForeignFieldFormatter
        }
    ],
    entryComponents: [
        SampleForeignSelectorComponent,
        ForeignSelectorComponent,
        TagSelectorComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
