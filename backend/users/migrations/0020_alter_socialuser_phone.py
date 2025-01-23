# Generated by Django 5.0.4 on 2024-06-07 13:08

import phonenumber_field.modelfields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0019_rename_created_at_friend_friends_since'),
    ]

    operations = [
        migrations.AlterField(
            model_name='socialuser',
            name='phone',
            field=phonenumber_field.modelfields.PhoneNumberField(max_length=128, region=None, unique=True),
        ),
    ]
