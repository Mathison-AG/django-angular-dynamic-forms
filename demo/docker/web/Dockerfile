FROM mhart/alpine-node

# Initialize
RUN mkdir -p /data/web
# WORKDIR /data/web


# Setup
RUN apk update
RUN apk upgrade
RUN apk add --update python3 python3-dev python2 build-base gettext git
RUN pip3 install --upgrade pip
# RUN pip3 install -r requirements.txt

RUN cd /data; git clone https://github.com/mesemus/django-angular-dynamic-forms.git
RUN cd /data/django-angular-dynamic-forms/demo/django; python3 setup.py install

RUN cd /data/django-angular-dynamic-forms/demo/django; python3 manage.py migrate

RUN cd /data/django-angular-dynamic-forms/demo/angular; npm install -g @angular/cli --unsafe
RUN cd /data/django-angular-dynamic-forms/demo/angular; npm install
RUN cd /data/django-angular-dynamic-forms/demo/angular; ng build --prod --aot
RUN cp -r /data/django-angular-dynamic-forms/demo/angular/dist /data/web/static
RUN ls -la /data/web/static

ADD run.sh /tmp/run.sh
RUN chmod 755 /tmp/run.sh

ENTRYPOINT ["/tmp/run.sh"]