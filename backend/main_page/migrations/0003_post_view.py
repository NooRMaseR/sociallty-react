# Generated by Django 5.0.4 on 2024-04-20 18:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main_page', '0002_alter_post_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='view',
            field=models.CharField(default='public', max_length=13),
        ),
    ]
