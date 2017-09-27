# Django Rest Framework integration with Angular dynamic forms

The aim of this project is to enable easy creation of Angular2 UI 
for django web applications. Django side provides REST api (via 
django-rest-framework) and optionally layout information. Angular2
side provides implementation of dynamic form that automatically downloads
layout information and initial data from the REST api, renders form,
submits data to django server, displays validation errors and after
successful submission notifies the parent component. There are two 
implementations: 
* "in-page" - the form is rendered directly in the parent container
* "dialog"  - caller can use `DjangoFormDialogService.open(...)`
  to open create/edit in dialog and be notified when the dialog is
  closed. 

# Demo application
 * clone the project
 * create new virtualenv for django project:
```
  virtualenv --python=python3 venv
  source venv/bin/activate
```
 * run django sample server
```
  cd lib/sandbox-django/testserver
  export DJANGO_SETTINGS_MODULE=testserver.settings
  ./manage.py migrate
  ./manage.py runserver 8000
```
 * install dependencies
```
  npm install
``` 
 * run the demo
```
 ng serve
``` 
 * Point browser to `http://localhost:4200` and enjoy

# Usage

## Django side

In order to render the form, angular part of the library needs 
to obtain additional metadata from django rest framework
- definition of fields and their layout. This functionality 
is implemented in `AngularFormMixin` that adds a new path
`.../form/` returning the metadata. For example:

```
> curl http://localhost:8000/api/1.0/cities/form/

{
    "method": "post",
    "form_title": "Creating a new city",
    "layout": [
        {
            "read_only": false,
            "id": "name",
            "max_length": 100,
            "type": "string",
            "label": "Name",
            "required": true
        }
    ],
    "has_initial_data": false,
    "actions": [
        {
            "id": "create",
            "label": "Create"
        },
        {
            "id": "cancel",
            "cancel": true,
            "label": "Cancel"
        }
    ]
}

``` 


When defining ViewSet, use this mixin:

```
class CityViewSet(AngularFormMixin, viewsets.ModelViewSet):
    """
    API for cities
    """
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = (permissions.AllowAny,)
```

and use Router or register the path yourself:

```
router = DefaultRouter()
router.register(r'cities', CityViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
]
```

## Angular side

### In-page

For the in-page use case, add `<inpage-django-form>` tag directly into
the template and bind the `django_url` to:
 * collection URL to create a new object inside the collection (for example, `http://localhost:8000/api/1.0/cities/`)
 * concrete object to edit the object  (for example, `http://localhost:8000/api/1.0/cities/1/`)

Optionally bind `submit` and `cancel` events to get notification after 
the form was submitted or cancelled.

See `app.component.html` for a working example.

### Dialog

The dialog version is even easier to use:

```
    constructor(private dialog: DjangoFormDialogService) {}
    
    private open() {
        this.dialog.open('http://localhost:8000/api/1.0/cities/', 
        // ok
        (data, response) => {
            console.log('submit ok', data, response);
        }, 
        // cancel
        data => {
            console.log('submit cancelled', data);
        });
    }
```

# Documentation

TBD
