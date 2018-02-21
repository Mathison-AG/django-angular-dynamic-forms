from rest_framework import viewsets, permissions, serializers

from angular_dynamic_forms.rest import foreign_field_autocomplete, ForeignFieldAutoCompleteMixin
from api.models import City, TestModel, Address
from angular_dynamic_forms import AngularFormMixin, AutoCompleteMixin, autocomplete


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ('name', 'zipcode', 'comment', 'id')


class CityViewSet(AngularFormMixin, viewsets.ModelViewSet):
    """
    API for cities
    """
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = (permissions.AllowAny,)

    form_layouts = {
        'full': ['name', 'zipcode', 'comment'],
        'simplified': ['name', 'zipcode']
    }


class TestModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestModel
        exclude = ()


class TestModelViewSet(AutoCompleteMixin, AngularFormMixin, viewsets.ModelViewSet):
    """
    API for TestModel
    """
    queryset = TestModel.objects.all()
    serializer_class = TestModelSerializer
    permission_classes = (permissions.AllowAny,)

    form_layout = [
        {
            'type': 'columns',
            'columns': [
                [
                    AngularFormMixin.fieldset('Core text',
                                              [
                                                  'string',
                                                  'area',
                                              ]),
                    AngularFormMixin.fieldset('Checkboxes and Radio Buttons',
                                              [
                                                  'radio',
                                                  'checkbox'
                                              ])
                ],
                [
                    AngularFormMixin.fieldset('Input fields',
                                              [
                                                  'name',
                                                  'email',
                                                  'number'
                                              ])
                ]
            ]
        }
    ]

    @autocomplete(field='name', formatter='{{item.name}} [{{item.id}}]')
    def name_autocomplete(self, search):
        return City.objects.filter(name__istartswith=search).order_by('name')


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        exclude = ()


class AddressViewSet(AutoCompleteMixin, ForeignFieldAutoCompleteMixin, AngularFormMixin, viewsets.ModelViewSet):
    """
    Second API for TestModel
    """
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = (permissions.AllowAny,)
    form_defaults = {
        'city': {
            'formatter': '{{name}}'
        }
    }

    @foreign_field_autocomplete(field='city', serializer=CitySerializer)
    def city_autocomplete(self, request):
        query = request.GET.get('query')
        qs = City.objects.all().order_by('name')
        if query:
            qs = qs.filter(name__icontains=query)
        return qs