from django.core.management import BaseCommand

from api.models import City, Tag, TestModel, Company


class Command(BaseCommand):
    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        c1 = City.objects.create(
            name="Prague", zipcode="11000", comment="Jenom poznámka"
        )
        City.objects.create(
            name="Paris", zipcode="75000", comment="Seulement une remarque"
        )
        City.objects.create(name="London", zipcode="WC2N 4JJ", comment="Just a comment")

        t1 = Tag.objects.create(name="001")
        t2 = Tag.objects.create(name="002")
        Tag.objects.create(name="003")
        Tag.objects.create(name="004")
        Tag.objects.create(name="005")
        Tag.objects.create(name="006")
        Tag.objects.create(name="007")

        tm = TestModel.objects.create(
            name="",
            radio=1,
            number=42,
            checkbox=False,
            string="Blah",
            area="What is the Answer to Life, the Universe, and Everything?",
            email="miroslav.simek@gmail.com",
            foreign_key=c1,
        )
        tm.tags.set([t1, t2])
        tm.save()

        company = Company.objects.create(name="UCT Prague")
