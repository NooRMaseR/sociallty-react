# Generated by Django 5.0.4 on 2024-04-27 14:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_alter_socialuser_profile_picture'),
    ]

    operations = [
        migrations.AlterField(
            model_name='socialuser',
            name='profile_picture',
            field=models.ImageField(default='media/profile_pictures/unknown.png', upload_to='profile_pictures/'),
        ),
    ]
