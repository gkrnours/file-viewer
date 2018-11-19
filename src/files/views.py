"""
    Set of views for the Files objects
"""
import logging

from rest_framework import viewsets

from .models import File
from .serializers import FileSerializer

logger = logging.getLogger(__name__)


class FileViewSet(viewsets.ModelViewSet):
    """
    Provide a list of stored file
    """
    queryset = File.objects.all()
    serializer_class = FileSerializer

    def get_queryset(self):
        """ Provide filtering for the viewset """
        queryset = self.queryset
        filter_type = self.request.query_params.get("type", None)
        if filter_type:
            queryset = queryset.filter(type=filter_type)
        return queryset
