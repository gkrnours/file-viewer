"""fileviewer URL Configuration
"""
from django.urls import path, include
from rest_framework import routers

from files import views

router = routers.DefaultRouter()
router.register(r'files', views.FileViewSet)

urlpatterns = [
    path('', include('files.urls')),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]
