#!/bin/bash

inotifywait -r -e close_write,move -m ../../angular/packages/django-angular-dynamic-forms | while read R; do
    echo "$R" | egrep 'jb_tmp|jb_old|MOVED_FROM' >/dev/null || {
        echo "sources modified, syncing $R"
        rm -rf src/django-angular-dynamic-forms
        cp -r ../../angular/packages/django-angular-dynamic-forms src/
    }
done

