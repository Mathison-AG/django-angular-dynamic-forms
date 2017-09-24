from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
from api.v_1.rest import CityViewSet

router = DefaultRouter()
router.register(r'cities', CityViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
]
