from django.core.management import BaseCommand

from api.models import City, Tag


class Command(BaseCommand):
    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        City.objects.create(name='Prague', zipcode='11000', comment='Jenom poznámka')
        City.objects.create(name='Paris', zipcode='75000', comment='Seulement une remarque')
        City.objects.create(name='London', zipcode='WC2N 4JJ', comment='Just a comment')

        Tag.objects.create(name='001')
        Tag.objects.create(name='002')
        Tag.objects.create(name='003')
        Tag.objects.create(name='004')
        Tag.objects.create(name='005')
        Tag.objects.create(name='006')
        Tag.objects.create(name='007')
