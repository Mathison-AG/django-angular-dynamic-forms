import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {IntroComponent} from './intro/intro.component';
import {CreateViaDialogComponent} from './create-via-dialog/create-via-dialog.component';
import {CreateInPageComponent} from './create-in-page/create-in-page.component';

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
        path: 'create-in-page',
        pathMatch: 'full',
        component: CreateInPageComponent
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
