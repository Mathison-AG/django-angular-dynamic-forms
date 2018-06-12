# noinspection PyUnresolvedReferences
import inspect
import re
from urllib.parse import urlsplit

from django.db.models import ManyToManyField
from django.http import HttpResponseNotFound, HttpResponseNotAllowed
from rest_framework import renderers, serializers
from rest_framework.decorators import detail_route, list_route, action
from rest_framework.metadata import SimpleMetadata
from rest_framework.response import Response
from rest_framework.serializers import ListSerializer, ModelSerializer
import django.db.models


class M2MEnabledMetadata(SimpleMetadata):
    def get_field_info(self, field):
        ret = super().get_field_info(field)
        print('field', field)
        if isinstance(field, serializers.ManyRelatedField) or isinstance(field, ListSerializer):
            ret['multiple'] = True
        return ret


class ForeignFieldAutoCompleteMixin(object):
    metadata_class = M2MEnabledMetadata
    max_returned_items = 10

    class __AutoCompleteRec:
        def __init__(self, search_method, serializer, pagination):
            self.search_method = search_method
            self.serializer = serializer
            self.pagination = pagination

    # noinspection PyUnusedLocal
    @action(detail=True, renderer_classes=[renderers.JSONRenderer], url_path='foreign-autocomplete/(?P<autocomplete_id>.*)',
                  methods=['get', 'post'])
    def foreign_autocomplete(self, request, *args, **kwargs):
        return self._foreign_autocomplete(request, has_instance=True, **kwargs)

    # noinspection PyUnusedLocal
    @action(detail=False, renderer_classes=[renderers.JSONRenderer], url_path='foreign-autocomplete/(?P<autocomplete_id>.*)',
                methods=['get', 'post'])
    def foreign_autocomplete_list(self, request, *args, **kwargs):
        return self._foreign_autocomplete(request, has_instance=False, **kwargs)

    def _foreign_autocomplete_definitions(self):
        if hasattr(self, '_foreign_autocomplete_definitions_cache'):
            return self._foreign_autocomplete_definitions_cache

        ret = {}

        for method_name, method in inspect.getmembers(self, inspect.ismethod):
            if not hasattr(method, '_foreign_autocomplete_field'):
                continue
            # noinspection PyUnresolvedReferences,PyProtectedMember
            ret[method._foreign_autocomplete_field] = \
                ForeignFieldAutoCompleteMixin.__AutoCompleteRec(method, method._foreign_autocomplete_serializer,
                                                                method._foreign_autocomplete_pagination)
        self._foreign_autocomplete_definitions_cache = ret
        return ret

    def _decorate_layout_item(self, item):
        super()._decorate_layout_item(item)
        item_id = item.get('id', None)
        if item_id in self._foreign_autocomplete_definitions():

            # noinspection PyUnresolvedReferences
            request = self.request

            path = request.path

            # must be called from /form/ or /form/<formid>/
            path = re.sub(r'/form(/[^/]+)?/?$', '', path)
            path = '%s/foreign-autocomplete/%s/' % (path, item_id)
            item['autocomplete_url'] = urlsplit(request.build_absolute_uri(path)).path

            # convert nested object (there was serializer for that) into a field
            if item.get('type') == 'nested object':
                item['type'] = 'field'

    # noinspection PyUnusedLocal
    def _foreign_autocomplete(self, request, has_instance, **kwargs):
        item_id = kwargs['autocomplete_id']
        foreign_autocomplete_definitions = self._foreign_autocomplete_definitions()
        if item_id not in foreign_autocomplete_definitions:
            return HttpResponseNotFound()
        filter_method = foreign_autocomplete_definitions[item_id].search_method
        qs = filter_method(request)
        paginated = foreign_autocomplete_definitions[item_id].pagination
        total = 0
        if paginated:
            pageIndex = int(request.GET.get('pageIndex', 0))
            pageSize = int(request.GET.get('pageSize', 0))
            if pageSize > self.max_returned_items:
                return HttpResponseNotAllowed('pageSize too big')
            total = qs.count()
            if pageSize:
                qs = qs[pageIndex * pageSize : (pageIndex + 1) * pageSize]
        else:
            qs = qs[:self.max_returned_items]

        serializer = foreign_autocomplete_definitions[item_id].serializer(many=True, instance=qs)
        if paginated:
            return Response({
                'length' : total,
                'items'  : serializer.data
            })
        else:
            return Response(serializer.data)


def foreign_field_autocomplete(field, serializer, pagination=False):
    def wrapper(real_func):
        real_func._foreign_autocomplete_field = field
        real_func._foreign_autocomplete_serializer = serializer
        real_func._foreign_autocomplete_pagination = pagination
        return real_func

    return wrapper


class ForeignSerializerMixin:

    def to_internal_value(self, data):
        self.__original_data = data
        return super().to_internal_value(data)

    def update(self, instance, validated_data):
        delayed_m2m = self._resolve_foreign_m2m(instance._meta, validated_data)
        inst = super().update(instance, validated_data)
        if delayed_m2m:
            for k, v in delayed_m2m.items():
                getattr(inst, k).set(v or set())
            inst.save()
        return inst

    def create(self, validated_data):
        delayed_m2m = self._resolve_foreign_m2m(self.Meta.model._meta, validated_data)
        inst = super().create(validated_data)
        if delayed_m2m:
            for k, v in delayed_m2m.items():
                getattr(inst, k).set(v or set())
            inst.save()
        return inst

    def _resolve_foreign_m2m(self, meta, validated_data):
        delayed_m2m = {}
        if not self.parent:
            for k, v in list(validated_data.items()):
                field = meta.get_field(k)
                if isinstance(v, list):
                    if v:
                        if isinstance(v[0], django.db.models.Model):
                            validated_data[k] = set(v)
                        elif isinstance(v[0], dict):
                            related_model = field.related_model
                            # convert the dict to model instances
                            v = [vv['id'] for vv in self.__original_data.get(k, [])]  # validation strips id, why???
                            v = set(related_model.objects.filter(pk__in=v))

                    else:
                        validated_data[k] = set()
                if v is None:
                    field = field
                    # convert null to empty set
                    if isinstance(field, ManyToManyField):
                        validated_data[k] = set()

                if isinstance(self.fields[k], ListSerializer):
                    delayed_m2m[k] = v
                    validated_data.pop(k)
                elif isinstance(self.fields[k], ModelSerializer):
                    related_model = field.related_model
                    orig = self.__original_data.get(k, {})
                    validated_data[k] = related_model.objects.get(pk=orig.get('id', None))
        return delayed_m2m
