import inspect
import re
from functools import lru_cache
from urllib.parse import urlsplit

from django.template import Template, Context
from rest_framework import renderers
from rest_framework.decorators import detail_route, list_route, action
from rest_framework.response import Response


class AutoCompleteMixin(object):
    max_returned_items = 10

    class __AutoCompleteRec:
        class __DummyFormatter:
            # noinspection PyMethodMayBeStatic
            def render(self, context):
                return str(context['item'])

        def __init__(self, search_method, formatter):
            self.search_method = search_method
            if formatter:
                self.formatter = Template(formatter)
            else:
                self.formatter = self.__DummyFormatter()

    # noinspection PyUnusedLocal
    @action(detail=True, renderer_classes=[renderers.JSONRenderer], url_path='autocomplete/(?P<autocomplete_id>.*)',
                  methods=['get', 'post'])
    def autocomplete(self, request, *args, **kwargs):
        return self._autocomplete(request, has_instance=True, **kwargs)

    # noinspection PyUnusedLocal
    @action(detail=False, renderer_classes=[renderers.JSONRenderer], url_path='autocomplete/(?P<autocomplete_id>.*)',
                methods=['get', 'post'])
    def autocomplete_list(self, request, *args, **kwargs):
        return self._autocomplete(request, has_instance=False, **kwargs)

    def _autocomplete_definitions(self):
        if hasattr(self, '_autocomplete_definitions_cache'):
            return self._autocomplete_definitions_cache

        ret = {}
        for method_name, method in inspect.getmembers(self, inspect.ismethod):
            if not hasattr(method, '_autocomplete_field'):
                continue
            # noinspection PyUnresolvedReferences,PyProtectedMember
            ret[method._autocomplete_field] = \
                AutoCompleteMixin.__AutoCompleteRec(method, method._autocomplete_formatter)
        self._autocomplete_definitions_cache = ret
        return ret

    def _decorate_layout_item(self, item):
        super()._decorate_layout_item(item)
        name = item.get('id', None)
        if name in self._autocomplete_definitions():

            # noinspection PyUnresolvedReferences
            request = self.request

            path = request.path

            # must be called from /form/ ...
            path = re.sub(r'/form(/[^/]+)?/?$', '', path)
            path = '%s/autocomplete/%s/' % (path, name)
            item['autocomplete_url'] = urlsplit(request.build_absolute_uri(path)).path

    # noinspection PyUnusedLocal
    def _autocomplete(self, request, has_instance, **kwargs):
        name = kwargs['autocomplete_id']
        autocomplete_definitions = self._autocomplete_definitions()
        qs = autocomplete_definitions[name].search_method
        query = request.GET['query']
        qs = qs(query)[:self.max_returned_items]
        formatter = autocomplete_definitions[name].formatter
        qs = [{
            'id'    : getattr(item, 'id', None) or item.get('id', None),
            'label' : formatter.render(context=Context({'item': item}))
        } for item in qs]
        return Response(qs)

    @lru_cache(maxsize=None)
    def _serializer_with_id(self, serializer):
        meta = type('Meta', (serializer.Meta,), {
            'fields': serializer.Meta.fields + ('id',)
        })
        clz = type('_clz', (serializer,), {
            'Meta': meta
        })
        return clz


def autocomplete(field, formatter):
    def wrapper(real_func):
        real_func._autocomplete_field = field
        real_func._autocomplete_formatter = formatter
        return real_func

    return wrapper
