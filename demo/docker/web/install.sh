#!/bin/sh

cd /data
git clone https://github.com/mesemus/django-angular-dynamic-forms.git

cd /data/django-angular-dynamic-forms
git log | head -10

version=$(
git tag | egrep '^[0-9]' \
    | awk -F. '{ printf "%010d %010d %010d\n", $1, $2, ($3+1) }' \
    | sort -rn \
    | head -n 1 \
    | tr ' ' '\n' \
    | sed 's/^0*//' | sed 's/^$/0/' \
    | tr '\n' '.'  \
    | sed 's/\.$//'
)

echo "Got version $version"

cd /data/django-angular-dynamic-forms/demo/django
python3 setup.py install
python3 manage.py migrate

cd /data/django-angular-dynamic-forms/demo/angular
npm install -g @angular/cli --unsafe
npm install

sed -i "s/version: \"\"/version: \"$version\"/" src/environments/environment.prod.ts

ng build --prod --aot

cp -r /data/django-angular-dynamic-forms/demo/angular/dist /data/web/static
ls -la /data/web/static

