from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from .views import settings, list, crud

urlpatterns = [
    path('all/', list.list),
    path('all/crud/', crud.crud),
    
    path('settings-general/', settings.retrieveAppSettings),
    path('settings-mapper/<str:tbl>/', settings.retrieveMapperSettings),
]

urlpatterns = format_suffix_patterns(urlpatterns)