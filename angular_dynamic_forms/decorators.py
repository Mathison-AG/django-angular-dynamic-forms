from functools import wraps

from rest_framework.response import Response
from rest_framework.decorators import action


def form_action(form_id=None, **kwargs):
    def wrapper(func):
        func.angular_form_id = form_id
        return action(**kwargs)(func)
    return wrapper
