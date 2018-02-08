#!/usr/bin/env python

from distutils.core import setup

setup(name='angular-test-server',
      version='1.0',
      description='Angular dynamic form test server',
      author='Mirek Simek',
      author_email='miroslav.simek@gmail.com',
      requires=[
          'Django',
          'djangorestframework',
      ]
     )
