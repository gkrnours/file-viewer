"""
    Models for the Files objects
"""
from django.db import models


class File(models.Model):
    """ Base model, hold the common attributes """
    name = models.CharField(max_length=150)
    type = models.CharField(max_length=10)
    ctime = models.DateTimeField(auto_now=True)
    file = models.FileField()

    def __str__(self):
        return "%s file: %s" % (self.type, self.name)


class ImageFile(File):
    """ Object specific to images. Hold a thumbnail """
    thumbnail = models.FileField(null=True)


class CSVFile(File):
    """ Object specific to CSV files. Hold the first 500 characters """
    head = models.TextField()
