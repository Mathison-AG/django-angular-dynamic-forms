from rest_framework import viewsets, permissions, serializers
from rest_framework.viewsets import ModelViewSet

from angular_dynamic_forms.decorators import form_action
from angular_dynamic_forms.foreign_key import ForeignSerializerMixin
from api.models import City, TestModel, Address, Tag, Contact, Company
from angular_dynamic_forms import (
    AngularFormMixin,
    AutoCompleteMixin,
    autocomplete,
    foreign_field_autocomplete,
    ForeignFieldAutoCompleteMixin,
    linked_forms,
    linked_form,
)


class CitySerializer(ForeignSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ("name", "zipcode", "comment", "id")


class CityViewSet(AngularFormMixin, viewsets.ModelViewSet):
    """
    API for cities
    """

    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = (permissions.AllowAny,)

    form_layouts = {
        "full": ["name", "zipcode", "comment"],
        "simplified": ["name", "zipcode"],
        "custom": ["name"],
    }

    @form_action(
        form_id="custom", detail=False, url_path="custom", methods=["GET", "POST"]
    )
    def custom_form_action(self, request):
        if request.method == "POST":
            request.data["zipcode"] = "A10000"
            return super().create(request)
        else:
            raise Exception()


class TagSerializer(ForeignSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Tag
        exclude = ()


class TestModelSerializer(ForeignSerializerMixin, serializers.ModelSerializer):
    tags = TagSerializer(many=True)
    foreign_key = CitySerializer()

    class Meta:
        model = TestModel
        exclude = ()


class TagViewSet(AngularFormMixin, ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class TestModelViewSet(
    ForeignFieldAutoCompleteMixin,
    AutoCompleteMixin,
    AngularFormMixin,
    viewsets.ModelViewSet,
):
    """
    API for TestModel
    """

    queryset = TestModel.objects.all()
    serializer_class = TestModelSerializer
    permission_classes = (permissions.AllowAny,)

    form_layout = [
        AngularFormMixin.columns(
            [
                AngularFormMixin.fieldset(
                    "Core text",
                    [
                        "string",
                        "area",
                    ],
                ),
                AngularFormMixin.fieldset(
                    "Checkboxes and Radio Buttons", ["radio", "checkbox"]
                ),
            ],
            [
                AngularFormMixin.fieldset(
                    "Input fields", ["name", "email", "number", "foreign_key", "tags"]
                )
            ],
        )
    ]

    @autocomplete(field="name", formatter="{{item.name}} [{{item.id}}]")
    def name_autocomplete(self, search):
        return City.objects.filter(name__istartswith=search).order_by("name")

    @foreign_field_autocomplete(
        field="foreign_key", serializer=CitySerializer, pagination=True
    )
    def city_autocomplete(self, request):
        query = request.GET.get("query")
        qs = City.objects.all().order_by("name")
        if query:
            qs = qs.filter(name__icontains=query)
        return qs

    @foreign_field_autocomplete(field="tags", serializer=TagSerializer)
    def tags_autocomplete(self, request):
        # sample implementation, just return all tags
        return Tag.objects.order_by("name")


class AddressSerializer(ForeignSerializerMixin, serializers.ModelSerializer):
    city = CitySerializer()

    class Meta:
        model = Address
        exclude = ()


class AddressViewSet(
    AutoCompleteMixin,
    ForeignFieldAutoCompleteMixin,
    AngularFormMixin,
    viewsets.ModelViewSet,
):
    """
    Second API for TestModel
    """

    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = (permissions.AllowAny,)

    @foreign_field_autocomplete(field="city", serializer=CitySerializer)
    def city_autocomplete(self, request):
        query = request.GET.get("query")
        qs = City.objects.all().order_by("name")
        if query:
            qs = qs.filter(name__icontains=query)
        return qs


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        exclude = ()


class ContactViewSet(AngularFormMixin, viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    form_layout = ("name", "email")


class CompanySerializer(serializers.ModelSerializer):
    contacts = ContactSerializer(many=True)

    class Meta:
        model = Company
        exclude = ()


@linked_forms()
class CompanyViewSet(AngularFormMixin, viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    linked_forms = {
        "new-contact": linked_form(ContactViewSet, link="company"),
        "edit-contact": linked_form(
            ContactViewSet, link="company", link_id="contactId"
        ),
    }
