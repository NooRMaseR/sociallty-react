# Generated by Django 5.0.4 on 2024-05-24 06:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main_page', '0010_alter_post_visibility'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='visibility',
            field=models.CharField(choices=[('public', 'Public'), ('private', 'Private'), ('friends only', 'Friends only')], default='public', max_length=13),
        ),
    ]
