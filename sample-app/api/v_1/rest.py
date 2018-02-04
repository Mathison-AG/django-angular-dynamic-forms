from rest_framework import viewsets, permissions, serializers

from api.models import City, TestModel
from angular_dynamic_forms import AngularFormMixin, AutoCompleteMixin, autocomplete


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ('name', 'id')


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
    API for TestModel
    """
    queryset = TestModel.objects.all()
    serializer_class = TestModelSerializer
    permission_classes = (permissions.AllowAny,)

    form_layout = [
        [
            'general',
            ['name'],
        ],
        'number',
        [
            'checkboxes and radio buttons',
            [
                'radio',
                'checkbox'
            ]
        ]
    ]

    @autocomplete(field='name', formatter='{{item.name}} [{{item.id}}]')
    def name_autocomplete(self, search):
        return City.objects.filter(name__istartswith=search).order_by('name')


class TestModel2ViewSet(AngularFormMixin, viewsets.ModelViewSet):
    """
    Second API for TestModel
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
