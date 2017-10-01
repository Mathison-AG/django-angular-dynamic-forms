from functools import lru_cache

from django.template import Template, Context
from django.utils.functional import cached_property
from rest_framework import viewsets, permissions, serializers, renderers
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response
from rest_framework.reverse import reverse

from api.models import City, TestModel


# noinspection PyUnresolvedReferences
class AngularFormMixin(object):
    form_layout = None
    form_title = None
    form_defaults = None

    def get_form_layout(self, fields):
        if self.form_layout:
            return self.form_layout
        # no layout, generate from fields
        layout = [{'id': field_name} for field_name in fields]
        for field in layout:
            if self.form_defaults and field['id'] in self.form_defaults:
                field.update(self.form_defaults[field['id']])
        return layout

    def get_form_title(self, has_instance, serializer):
        if self.form_title:
            return self.form_title['edit' if has_instance else 'create']

        name = serializer.Meta.model._meta.verbose_name
        if has_instance:
            name = 'Editing %s' % name
        else:
            name = 'Creating a new %s' % name

        return name

    def get_actions(self, has_instance, serializer):
        if has_instance:
            return [
                {
                    'id': 'save',
                    'label': 'Save'
                },
                {
                    'id': 'cancel',
                    'label': 'Cancel',
                    'cancel': True
                },
            ]
        else:
            return [
                {
                    'id': 'create',
                    'label': 'Create'
                },
                {
                    'id': 'cancel',
                    'label': 'Cancel',
                    'cancel': True
                },
            ]

    @detail_route(renderer_classes=[renderers.JSONRenderer], url_path='form')
    def form(self, request, *args, **kwargs):
        return self.get_form_metadata(has_instance=True)

    @list_route(renderer_classes=[renderers.JSONRenderer], url_path='form')
    def form_list(self, request, *args, **kwargs):
        return self.get_form_metadata(has_instance=False)

    def get_form_metadata(self, has_instance):
        ret = {}
        serializer = self.get_serializer()
        metadata_class = self.metadata_class()
        fields = []

        fields_info = metadata_class.get_serializer_info(serializer=serializer)
        layout = self.get_form_layout(fields_info)
        layout = self.decorate_layout(layout, fields_info)

        ret['layout'] = layout

        ret['form_title'] = self.get_form_title(has_instance, serializer)

        ret['actions'] = self.get_actions(has_instance, serializer)

        ret['method'] = 'patch' if has_instance else 'post'
        ret['has_initial_data'] = has_instance

        return Response(ret)

    def decorate_layout(self, layout, fields_info):
        # layout is a list
        ret = []
        for it in layout:
            if isinstance(it, dict) and it['id'] in fields_info:
                md = dict(fields_info[it['id']])
                md.update(it)
            elif isinstance(it, str) and it in fields_info:
                md = fields_info[it]
            else:
                raise NotImplementedError('Fieldsets and other constructs not yet implemented')
            self.decorate_layout_item(md)
            ret.append(md)
        return ret

    def decorate_layout_item(self, item):
        pass


class AutoCompleteMixin(object):
    namespace = None
    max_returned_items = 10

    class __DummyFormatter:
        def render(self, context):
            return str(context['item'])

    class __AutoCompleteRec:
        def __init__(self, search_method, formatter):
            self.search_method = search_method
            if formatter:
                self.formatter = Template(formatter)
            else:
                self.formatter = AutoCompleteMixin.__DummyFormatter()

    @detail_route(renderer_classes=[renderers.JSONRenderer], url_path='autocomplete/(?P<autocomplete_id>.*)',
                  methods=['get', 'post'])
    def autocomplete(self, request, *args, **kwargs):
        return self._autocomplete(request, has_instance=True, **kwargs)

    @list_route(renderer_classes=[renderers.JSONRenderer], url_path='autocomplete/(?P<autocomplete_id>.*)',
                methods=['get', 'post'])
    def autocomplete_list(self, request, *args, **kwargs):
        return self._autocomplete(request, has_instance=False, **kwargs)

    @cached_property
    def _autocomplete_defs(self):
        ret = {}
        for method_name in dir(self):
            # prevent recursion ...
            if method_name == '_autocomplete_defs':
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
        name = item['id']
        if name in self._autocomplete_defs:
            item['autocomplete_url'] = self.request.build_absolute_uri(
                reverse('%s:testmodel-autocomplete/(?P<autocomplete-id>.*)' % self.namespace,
                        kwargs={
                            'autocomplete_id': name
                        }))

    def _autocomplete(self, request, has_instance, **kwargs):
        name = kwargs['autocomplete_id']
        qs = self._autocomplete_defs[name].search_method
        query = request.GET['query']
        qs = qs(query)[:self.max_returned_items]
        formatter = self._autocomplete_defs[name].formatter
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


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ('name',)


class CityViewSet(AngularFormMixin, viewsets.ModelViewSet):
    """
    API for cities
    """
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = (permissions.AllowAny,)


class TestModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestModel
        fields = ('name', 'radio', 'number', 'checkbox')


class TestModelViewSet(AutoCompleteMixin, AngularFormMixin, viewsets.ModelViewSet):
    """
    API for cities
    """
    queryset = TestModel.objects.all()
    serializer_class = TestModelSerializer
    permission_classes = (permissions.AllowAny,)

    # namespace in urls of this viewset
    namespace = 'api_v_1'

    @autocomplete(field='name', formatter='{{item.name}} [{{item.id}}]')
    def name_autocomplete(self, search):
        return City.objects.filter(name__istartswith=search).order_by('name')


class TestModel2ViewSet(AngularFormMixin, viewsets.ModelViewSet):
    """
    API for cities
    """
    queryset = TestModel.objects.all()
    serializer_class = TestModelSerializer
    permission_classes = (permissions.AllowAny,)
    form_defaults = {
        'radio': {'type': 'radio'},
        'name': {
            'autocomplete_list': [chr(x) for x in range(40, 256)]
        }
    }
