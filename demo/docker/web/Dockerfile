FROM alpine

# Initialize
RUN mkdir -p /data/web
# WORKDIR /data/web


# Setup
RUN apk update
RUN apk upgrade
RUN apk add --update python3 python3-dev build-base gettext git
RUN pip3 install --upgrade pip
# RUN pip3 install -r requirements.txt

RUN cd /data; git clone https://github.com/mesemus/django-angular-dynamic-forms.git
RUN cd /data/django-angular-dynamic-forms/demo/django; python3 setup.py install

# Clean
# RUN apk del -r python3-dev postgresql

# Prepare
# COPY . /data/web/
# RUN mkdir -p mydjango/static/admin

