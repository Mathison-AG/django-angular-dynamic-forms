Django Rest Framework meets Angular 5 dynamic forms
===================================================

This repo provides Django mixins and Angular library for rapid
development of create/edit dialogs for django rest framework.
It depends on Angular5 and Material UI.

On django side, extend your ``Viewset`` to use ``AngularFormMixin``
and optionally configure the mixin by providing either layout
information or field defaults (such as css classes). See demos
for details.

.. code-block:: python

    class CityViewSet(AngularFormMixin, viewsets.ModelViewSet):
        """
        API for cities
        """
        queryset = City.objects.all()
        serializer_class = CitySerializer


On angular side, use ``DjangoFormDialogService`` to display a dialog:

.. code-block:: typescript

    constructor(private dialog: DjangoFormDialogService) {
    }
    createCity() {
        this.dialog.open('/api/1.0/cities/').subscribe(result => {
            console.log('City created, result from server is:', result);
        });
    }

You can also display the form inside your own component via ``<inpage-django-form>`` tag.

.. code-block:: html

    <inpage-django-form django_url="/api/1.0/cities/"
                        (submit)="submit($event)"
                        (cancel)="cancel($event)"></inpage-django-form>



Demo and sample source files
----------------------------

See demos at http://mesemus.no-ip.org:12569

.. image:: https://raw.githubusercontent.com/mesemus/django-angular-dynamic-forms/develop/docs/demo.png

With a bit of work on your side, foreign keys and many-to-many relationships are supported as well (see the demos for details)

.. image:: https://raw.githubusercontent.com/mesemus/django-angular-dynamic-forms/develop/docs/foreign_key.png



Installation
------------

*Django side:*

.. code-block:: bash

    pip install django-angular-dynamic-forms

*Angular side:*

.. code-block:: bash

    npm install --save django-angular-dynamic-forms @ng-dynamic-forms/core @ng-dynamic-forms/ui-material

To render forms, this library uses https://github.com/udos86/ng-dynamic-forms - do not forget
to add it to your package.json.

and add ``DjangoFormModule`` to imports. You will need to provide your own ErrorService for showing
communication errors back to the user. See the ``demo/angular/src/app/mat-error.service.ts`` for
an example implementation.

.. code-block:: typescript

    import {DjangoFormModule, ErrorService} from 'django-angular-dynamic-forms';

    @NgModule({
        declarations: [
            ...
        ],
        imports: [
            BrowserAnimationsModule,
            DynamicFormsCoreModule.forRoot(),
            DynamicFormsMaterialUIModule,
            DjangoFormModule,
            HttpClientModule,
            ...
        ],
        providers: [
            {
                provide: ErrorService,
                useClass: MatErrorService
            },
        ],
        bootstrap: [AppComponent]
    })
    export class AppModule {
    }
