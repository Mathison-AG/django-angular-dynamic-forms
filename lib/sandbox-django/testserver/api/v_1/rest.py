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
    form_title   = None

    def get_form_layout(self, fields):
        if self.form_layout:
            return self.form_layout
        # no layout, generate from fields
        layout = [{'id': field_name} for field_name in fields]
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
