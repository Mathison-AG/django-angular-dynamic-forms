FROM mhart/alpine-node

# Initialize
RUN mkdir -p /data/web
# WORKDIR /data/web


# Setup
RUN apk update
RUN apk upgrade
RUN apk add --update python3 python3-dev python2 build-base gettext git sed gawk bash
RUN pip3 install --upgrade pip gunicorn
# RUN pip3 install -r requirements.txt

ADD install.sh /tmp/install.sh
RUN chmod 755 /tmp/install.sh

ADD run.sh /tmp/run.sh
RUN chmod 755 /tmp/run.sh

ADD index.html /tmp/index.html

ENTRYPOINT ["/tmp/run.sh"]