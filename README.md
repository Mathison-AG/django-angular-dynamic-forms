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

# Documentation

TBD
