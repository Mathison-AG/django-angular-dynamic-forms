#!/bin/sh

/tmp/install.sh

cd /data/django-angular-dynamic-forms/demo/django
# python3 manage.py runserver 0.0.0.0:8000

gunicorn -b 0.0.0.0:8000 -w 2 testserver.wsgi
