from django.conf.urls import url, include
from .v_1 import urls as urls_v_1

urlpatterns = [
    url(r"^1.0/", include(urls_v_1)),
]
