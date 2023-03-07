from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
from api.v_1.rest import CityViewSet, TestModelViewSet, AddressViewSet, CompanyViewSet

router = DefaultRouter()
router.register(r"cities", CityViewSet)
router.register(r"test", TestModelViewSet)
router.register(r"addresses", AddressViewSet)
router.register(r"companies", CompanyViewSet)

urlpatterns = [
    url(r"^", include(router.urls)),
]
