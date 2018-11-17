from django.db import models


class File(models.Model):
    name = models.CharField(max_length=150)
    type = models.CharField(max_length=10)
    ctime = models.DateTimeField(auto_now=True)
    file = models.FileField()


class ImageFile(File):
    thumbnail = models.FileField(null=True)


class CSVFile(File):
    head = models.TextField()
