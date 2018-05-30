from functools import wraps

from rest_framework.response import Response
from rest_framework.decorators import action


def form_action(form_id=None, **kwargs):
    def wrapper(func):

        @wraps(func)
        def wrapped(self, request, *args, form_sign=None, **wrapped_kwargs):
            if not form_sign:
                wrapped_kwargs.pop('form_sign', None)
                return func(self, request, *args, **wrapped_kwargs)
            # else generate the form ...
            return Response(self._get_form_metadata(has_instance=kwargs.get('detail', False), form_name=form_id or ''))

        methods = kwargs.pop('methods', ['GET'])
        if 'GET' not in methods:
            methods = list(methods) + ['GET']
        url_path = kwargs.pop('url_path', func.__name__)
        url_path += '(?P<form_sign>(/form)?)'
        return action(methods=methods, url_path=url_path, **kwargs)(wrapped)

    return wrapper
