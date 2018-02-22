from rest_framework import viewsets, permissions, serializers

from api.models import City, TestModel, Address, Tag
from angular_dynamic_forms import AngularFormMixin, AutoCompleteMixin, autocomplete, \
    foreign_field_autocomplete, ForeignFieldAutoCompleteMixin


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


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        exclude = ()


class TestModelViewSet(ForeignFieldAutoCompleteMixin, AutoCompleteMixin, AngularFormMixin, viewsets.ModelViewSet):
    """
    API for TestModel
    """
    queryset = TestModel.objects.all()
    serializer_class = TestModelSerializer
    permission_classes = (permissions.AllowAny,)

    form_layout = [
        AngularFormMixin.columns(
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
                                              'number',
                                              'foreign_key',
                                              'tags'
                                          ])
            ]
        )
    ]

    @autocomplete(field='name', formatter='{{item.name}} [{{item.id}}]')
    def name_autocomplete(self, search):
        return City.objects.filter(name__istartswith=search).order_by('name')

    @foreign_field_autocomplete(field='foreign_key', serializer=CitySerializer, pagination=True)
    def city_autocomplete(self, request):
        query = request.GET.get('query')
        qs = City.objects.all().order_by('name')
        if query:
            qs = qs.filter(name__icontains=query)
        return qs

    @foreign_field_autocomplete(field='tags', serializer=TagSerializer)
    def tags_autocomplete(self, request):
        # sample implementation, just return all tags
        return Tag.objects.order_by('name')


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
