from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


# Create your models here.


class City(models.Model):
    name = models.CharField(max_length=100)
    zipcode = models.CharField(max_length=20)
    comment = models.TextField(null=True, blank=True)

    def get_absolute_url(self):
        return "/api/1.0/cities/%s" % self.id


class Address(models.Model):
    street = models.CharField(max_length=100, null=True, blank=True)
    number = models.CharField(max_length=100, null=True, blank=True)
    city = models.ForeignKey(City, null=True, blank=True, on_delete=models.SET_NULL)


class Tag(models.Model):
    name = models.CharField(max_length=20)


class TestModel(models.Model):
    name = models.CharField(verbose_name="City autocomplete", max_length=10)
    radio = models.CharField(
        max_length=1, choices=((1, "One"), (2, "Two"), (3, "Three"))
    )
    number = models.IntegerField(
        validators=[MaxValueValidator(100), MinValueValidator(0)]
    )
    checkbox = models.BooleanField()
    string = models.CharField(max_length=100)
    area = models.TextField()
    email = models.EmailField()
    foreign_key = models.ForeignKey(
        City, null=True, blank=True, on_delete=models.CASCADE, related_name="+"
    )
    tags = models.ManyToManyField(
        Tag, related_name="+", blank=True, verbose_name="Tags (many to many field)"
    )


class Company(models.Model):
    name = models.CharField(max_length=100)


class Contact(models.Model):
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="contacts"
    )
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
