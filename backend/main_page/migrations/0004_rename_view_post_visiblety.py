# Generated by Django 5.0.4 on 2024-04-20 18:48

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main_page', '0003_post_view'),
    ]

    operations = [
        migrations.RenameField(
            model_name='post',
            old_name='view',
            new_name='visiblety',
        ),
    ]
