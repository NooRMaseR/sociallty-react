# Generated by Django 5.0.4 on 2024-05-28 15:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0016_alter_socialuser_phone'),
    ]

    operations = [
        migrations.AlterField(
            model_name='socialuser',
            name='phone',
            field=models.BigIntegerField(default=101010101010, unique=True),
            preserve_default=False,
        ),
    ]
