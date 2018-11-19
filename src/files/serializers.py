"""
    module with serializers for the files app
"""
import csv
import logging

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework import serializers
from .models import File, CSVFile, ImageFile

logger = logging.getLogger(__name__)

THUMBNAIL_SIZE = getattr(settings, 'THUMBNAIL_SIZE', (128, 128))


def _head(file):
    """ Take a file-object, return 500 first characters as string """
    return next(file.chunks(chunk_size=500)).decode('utf-8')


class FileSerializer(serializers.HyperlinkedModelSerializer):
    """
        Handle file, saving in database with the correct type and extra info
    """
    class Meta:
        model = File
        fields = ('name', 'type', 'ctime', 'file')
        read_only_fields = ('type', 'ctime')

    # Validation
    def validate_file(self, value):
        """ Make sure the provided file can be handled """
        logger.debug(('validate_file', value.content_type))
        if value.content_type.startswith("image/"):
            self._check_image(value)
            return value
        if self._is_csv(value):
            value.content_type = "text/csv"
            return value
        msg = "Unsupported format (%s)" % value.content_type
        raise serializers.ValidationError(msg)

    @staticmethod
    def _check_image(file):
        """ Internal: file have been detected as image, ask pillow opinion """
        try:
            Image.open(file)
        except IOError as err:
            logger.exception(err)
            raise serializers.ValidationError("Not an image")

    @staticmethod
    def _is_csv(file):
        """ Internal: see if python's CSV module can read the file """
        head = _head(file)
        try:
            csv.Sniffer().sniff(head)
            file.seek(0)
        except csv.Error:
            raise serializers.ValidationError("Not a recognized CSV")
        return True

    def validate(self, attrs):
        """ Set a type for the incoming data matching the provided file """
        logger.debug(('validate', attrs))
        content_type = attrs["file"].content_type
        if content_type.startswith("image/"):
            attrs["type"] = "image"
        elif content_type == "text/csv":
            attrs["type"] = "csv"
        return attrs

    # Create
    def create(self, validated_data):
        """ Delegate creation to sub-function according to type  """
        if not "type" in validated_data:
            msg = "No type, validator should have prevented that"
            raise RuntimeError(msg)
        if validated_data["type"] == "csv":
            return self._create_csv_file(validated_data)
        if validated_data["type"] == "image":
            return self._create_image_file(validated_data)
        msg = "Unrecognized type, aborting"
        raise RuntimeError(msg)

    @staticmethod
    def _create_csv_file(validated_data):
        """ Create a CSV file with the first few characters available """
        head = _head(validated_data['file'])
        obj = CSVFile.objects.create(head=head, **validated_data)
        return obj

    @staticmethod
    def _create_image_file(validated_data):
        """ Create an Image file with a thumbnail """
        thumbnail = SimpleUploadedFile.from_dict({
            'filename':'tmp.jpeg', 'content':b''})
        image = Image.open(validated_data["file"])
        image.thumbnail(THUMBNAIL_SIZE)
        image.save(thumbnail, "JPEG")
        obj = ImageFile.objects.create(thumbnail=thumbnail, **validated_data)
        return obj

    # Read
    def to_representation(self, instance):
        """ Inject extra field when retrieving from db """
        data = super().to_representation(instance)
        if data["type"] == "csv":
            data["head"] = instance.csvfile.head
        if data["type"] == "image":
            request = self.context.get('request', None)
            thumbnail = instance.imagefile.thumbnail
            url = thumbnail.url
            if request is not None:
                url = request.build_absolute_uri(url)
            data["thumbnail"] = url
        return data
