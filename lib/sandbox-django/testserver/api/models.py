from django.db import models


# Create your models here.


class City(models.Model):
    name = models.CharField(max_length=100)


class Address(models.Model):
    street = models.CharField(max_length=100, null=True, blank=True)
    number = models.CharField(max_length=100, null=True, blank=True)
    city = models.ForeignKey(City, null=True, blank=True)
