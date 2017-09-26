from django.conf.urls import url, include
from rest_framework.routers import DefaultRouter

# Create a router and register our viewsets with it.
from api.v_1.rest import CityViewSet, TestModelViewSet, TestModel2ViewSet

router = DefaultRouter()
router.register(r'cities', CityViewSet)
router.register(r'test', TestModelViewSet)
router.register(r'test2', TestModel2ViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
]
