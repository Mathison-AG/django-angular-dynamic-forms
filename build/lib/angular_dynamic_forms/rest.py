# noinspection PyUnresolvedReferences
import json
import re
from functools import lru_cache

from django.core.exceptions import FieldDoesNotExist
from django.db.models import TextField
from django.http import HttpResponseNotFound
from django.template import Template, Context
from django.utils.functional import cached_property
from django.utils.translation import gettext
from rest_framework import renderers
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response


class AngularFormMixin(object):
    form_layout = None
    form_title = None
    form_defaults = None

    form_layouts  = None
    form_titles   = None
    form_defaults_map = None

    def get_form_layout(self, fields, form_name):
        if form_name:
            form_layout = self.form_layouts[form_name]
        else:
            form_layout = self.form_layout

        if form_layout:
            if callable(form_layout):
                return self._transform_layout(form_layout(fields))
            return self._transform_layout(form_layout)

        # no layout, generate from fields
        layout = [self._get_field_layout(field_name, fields[field_name])
                    for field_name in fields if not fields[field_name]['read_only']]

        if form_name:
            form_defaults = self.form_defaults_map.get(form_name, None)
        else:
            form_defaults = self.form_defaults

        if callable(form_defaults):
            form_defaults = form_defaults(fields)

        for field in layout:
            if form_defaults and field['id'] in form_defaults:
                field.update(form_defaults[field['id']])
        return layout

    def _get_field_layout(self, field_name, field):
        if field['type'] == 'string':
            # string or textarea?
            qs = self.get_queryset()
            model = qs.model
            if model:
                try:
                    field = model._meta.get_field(field_name)
                    if isinstance(field, TextField):
                        return {
                            'id': field_name,
                            'type': 'textarea'
                        }
                except FieldDoesNotExist:
                    pass
            pass
        return {'id': field_name}

    def _transform_layout(self, layout):
        if isinstance(layout, dict):
            layout = layout.copy()
            for (k, v) in list(layout.items()):
                if callable(v):
                    layout[k] = v(self)
            if layout.get('type', 'string') != 'fieldset':
                return layout
            layout['controls'] = self._transform_layout(layout['controls'])
            return layout
        if isinstance(layout, list) or isinstance(layout, tuple):
            if (
                    len(layout) == 2 and isinstance(layout[0], str) and
                    (isinstance(layout[1], list) or isinstance(layout[1], tuple))):

                # it is a fieldset ...
                return {
                    'type'     : 'fieldset',
                    'label'    : layout[0],
                    'cls'      : {
                        'element': {
                            'container': 'fieldset'
                        }
                    },
                    'controls' : self._transform_layout(layout[1])
                }
            # otherwise it is a plain list of controls
            return [
                self._transform_layout(l) for l in layout
            ]
        if isinstance(layout, str):
            return {
                'id': layout
            }
        raise NotImplementedError('Layout "%s" not implemented' % layout)

    def get_form_title(self, has_instance, serializer, form_name):
        form_title = self.form_title
        if form_name and self.form_titles:
            form_title = self.form_titles.get(form_name, None)

        if form_title:
            return self.form_title['edit' if has_instance else 'create']

        # noinspection PyProtectedMember
        name = serializer.Meta.model._meta.verbose_name
        if has_instance:
            name = gettext('Editing %s') % name
        else:
            name = gettext('Creating a new %s') % name

        return name

    # noinspection PyMethodMayBeStatic,PyUnusedLocal
    def get_actions(self, has_instance, serializer):
        if has_instance:
            return [
                {
                    'id': 'save',
                    'label': gettext('Save')
                },
                {
                    'id': 'cancel',
                    'label': gettext('Cancel'),
                    'cancel': True
                },
            ]
        else:
            return [
                {
                    'id': 'create',
                    'label': gettext('Create')
                },
                {
                    'id': 'cancel',
                    'label': gettext('Cancel'),
                    'cancel': True
                },
            ]

    # noinspection PyUnusedLocal
    @detail_route(renderer_classes=[renderers.JSONRenderer], url_path='form')
    def form(self, request, *args, **kwargs):
        return self.get_form_metadata(has_instance=True)

    # noinspection PyUnusedLocal
    @list_route(renderer_classes=[renderers.JSONRenderer], url_path='form')
    def form_list(self, request, *args, **kwargs):
        return self.get_form_metadata(has_instance=False)

    # noinspection PyUnusedLocal
    @detail_route(renderer_classes=[renderers.JSONRenderer], url_path='form/(?P<form_name>.+)')
    def form_with_name(self, request, *args, form_name=None, **kwargs):
        return self.get_form_metadata(has_instance=True, form_name = form_name or '')

    # noinspection PyUnusedLocal
    @list_route(renderer_classes=[renderers.JSONRenderer], url_path='form/(?P<form_name>.+)')
    def form_list_with_name(self, request, *args, form_name=None, **kwargs):
        return self.get_form_metadata(has_instance=False, form_name = form_name or '')

    def get_form_metadata(self, has_instance, form_name=''):

        if form_name:
            if not self.form_layouts:
                return HttpResponseNotFound('Form layouts not configured. '
                                            'Please add form_layouts attribute on the viewset class')

            if form_name not in self.form_layouts:
                return HttpResponseNotFound('Form with name %s not found' % form_name)

        ret = {}

        # noinspection PyUnresolvedReferences
        serializer = self.get_serializer()

        # noinspection PyUnresolvedReferences
        metadata_class = self.metadata_class()

        fields_info = metadata_class.get_serializer_info(serializer=serializer)
        layout = self.get_form_layout(fields_info, form_name)
        layout = self.decorate_layout(layout, fields_info)

        ret['layout'] = layout

        ret['form_title'] = self.get_form_title(has_instance, serializer, form_name)

        ret['actions'] = self.get_actions(has_instance, serializer)

        ret['method'] = 'patch' if has_instance else 'post'
        ret['has_initial_data'] = has_instance

        # print(json.dumps(ret, indent=4))

        return Response(ret)

    def decorate_layout(self, layout, fields_info):
        if isinstance(layout, list):
            ret = []
            for it in layout:
                ret.append(self.decorate_layout(it, fields_info))
            return ret
        elif isinstance(layout, dict):
            if layout.get('type', None) == 'fieldset':
                layout = dict(layout)
                layout['controls'] = self.decorate_layout(layout['controls'], fields_info)
                self.decorate_layout_item(layout)
                return layout
            else:
                md = dict(fields_info[layout['id']])
                md.update(layout)
                self.decorate_layout_item(md)
                return md

    def decorate_layout_item(self, item):
        pass


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
    @detail_route(renderer_classes=[renderers.JSONRenderer], url_path='autocomplete/(?P<autocomplete_id>.*)',
                  methods=['get', 'post'])
    def autocomplete(self, request, *args, **kwargs):
        return self._autocomplete(request, has_instance=True, **kwargs)

    # noinspection PyUnusedLocal
    @list_route(renderer_classes=[renderers.JSONRenderer], url_path='autocomplete/(?P<autocomplete_id>.*)',
                methods=['get', 'post'])
    def autocomplete_list(self, request, *args, **kwargs):
        return self._autocomplete(request, has_instance=False, **kwargs)

    @cached_property
    def _autocomplete_definitions(self):
        ret = {}
        for method_name in dir(self):
            # prevent recursion ...
            if method_name == '_autocomplete_definitions':
                continue
            try:
                method = getattr(self, method_name)
            except AttributeError:
                continue
            if not callable(method):
                continue
            if not hasattr(method, '_autocomplete_field'):
                continue
            # noinspection PyUnresolvedReferences,PyProtectedMember
            ret[method._autocomplete_field] = \
                AutoCompleteMixin.__AutoCompleteRec(method, method._autocomplete_formatter)
        return ret

    def decorate_layout_item(self, item):
        name = item.get('id', None)
        if name in self._autocomplete_definitions:

            # noinspection PyUnresolvedReferences
            request = self.request

            path = request.path

            # must be called from /form/ ...
            path = re.sub(r'/form/?$', '', path)
            path = '%s/autocomplete/%s/' % (path, name)
            item['autocomplete_url'] = request.build_absolute_uri(path)

    # noinspection PyUnusedLocal
    def _autocomplete(self, request, has_instance, **kwargs):
        name = kwargs['autocomplete_id']
        qs = self._autocomplete_definitions[name].search_method
        query = request.GET['query']
        qs = qs(query)[:self.max_returned_items]
        formatter = self._autocomplete_definitions[name].formatter
        qs = [{
            'id'    : item.id,
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
