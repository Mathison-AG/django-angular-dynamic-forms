from django.views import View
from rest_framework import viewsets, permissions, serializers, renderers
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response

from api.models import City


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ('name',)


# noinspection PyUnresolvedReferences
class AngularFormMixin(object):
    form_layout = None
    form_name   = None

    def get_form_layout(self, fields):
        if self.form_layout:
            return self.form_layout
        # no layout, generate from fields
        layout = [{'name': field_name} for field_name in fields]
        return layout

    def get_form_name(self, serializer):
        if self.form_name:
            return self.form_name
        return serializer.Meta.model._meta.verbose_name

    @detail_route(renderer_classes=[renderers.JSONRenderer], url_path='form')
    def form(self, request, *args, **kwargs):
        return self.get_form_metadata()

    @list_route(renderer_classes=[renderers.JSONRenderer], url_path='form')
    def form_list(self, request, *args, **kwargs):
        return self.get_form_metadata()

    def get_form_metadata(self):
        ret = {}
        serializer = self.get_serializer()
        metadata_class = self.metadata_class()
        fields = []

        fields_info = metadata_class.get_serializer_info(serializer=serializer)
        layout = self.get_form_layout(fields_info)
        layout = self.decorate_layout(layout, fields_info)

        ret['form_layout'] = layout
        ret['form_name']   = self.get_form_name(serializer=serializer)
        return Response(ret)

    def decorate_layout(self, layout, fields_info):
        # layout is a list
        ret = []
        for it in layout:
            if isinstance(it, dict) and it['name'] in fields_info:
                md = dict(fields_info[it['name']])
                md.update(it)
                ret.append(md)
            elif isinstance(it, str) and it in fields_info:
                ret.append(fields_info[it])
            else:
                raise NotImplementedError('Fieldsets and other constructs not yet implemented')
        return ret


class CityViewSet(AngularFormMixin, viewsets.ModelViewSet):
    """
    API for cities
    """
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = (permissions.AllowAny,)
