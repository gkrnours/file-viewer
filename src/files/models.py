from django.db import models


class File(models.Model):
    name = models.CharField(max_length=150)
    type = models.CharField(max_length=10)
    ctime = models.DateTimeField(auto_now=True)
    file = models.FileField()

    def __str__(self):
        return "%s file: %s" % (self.type, self.name)


class ImageFile(File):
    thumbnail = models.FileField(null=True)


class CSVFile(File):
    head = models.TextField()
