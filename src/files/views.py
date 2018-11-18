from rest_framework import viewsets
from .models import File
from .serializers import FileSerializer


class FileViewSet(viewsets.ModelViewSet):
    """
    Provide a list of stored file
    """
    queryset = File.objects.all()
    serializer_class = FileSerializer
