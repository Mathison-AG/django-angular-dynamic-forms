import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {IntroComponent} from './intro/intro.component';
import {CreateViaDialogComponent} from './create-via-dialog/create-via-dialog.component';
import {CreateInPageComponent} from './create-in-page/create-in-page.component';
import {CreateViaDialogInitialDataComponent} from './create-via-dialog-initial-data/create-via-dialog-initial-data.component';
import {CreateInPageInitialDataComponent} from './create-in-page-initial-data/create-in-page-initial-data.component';
import {EditViaDialogComponent} from './edit-via-dialog/edit-via-dialog.component';
import {EditInPageComponent} from './edit-in-page/edit-in-page.component';
import {TableComponent as EditInPageTableComponent} from './edit-in-page/table/table.component';
import {FormComponent as EditInPageFormComponent} from './edit-in-page/form/form.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: IntroComponent
    },
    {
        path: 'create-via-dialog',
        pathMatch: 'full',
        component: CreateViaDialogComponent
    },
    {
        path: 'create-via-dialog-initial-data',
        pathMatch: 'full',
        component: CreateViaDialogInitialDataComponent
    },
    {
        path: 'create-in-page',
        pathMatch: 'full',
        component: CreateInPageComponent
    },
    {
        path: 'create-in-page-initial-data',
        pathMatch: 'full',
        component: CreateInPageInitialDataComponent
    },
    {
        path: 'edit-via-dialog',
        pathMatch: 'full',
        component: EditViaDialogComponent
    },
    {
        path: 'edit-in-page',
        pathMatch: 'prefix',
        component: EditInPageComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: EditInPageTableComponent
            },
            {
                path: ':id',
                pathMatch: 'full',
                component: EditInPageFormComponent
            },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
