import csv
import logging

from rest_framework import serializers
from .models import File

logger = logging.getLogger(__name__)


class FileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = File
        fields = ('name', 'type', 'ctime', 'file')
        read_only_fields = ('type', 'ctime')
