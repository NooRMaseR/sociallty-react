# Generated by Django 5.0.4 on 2024-04-14 16:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_alter_socialuser_profile_picture'),
    ]

    operations = [
        migrations.AlterField(
            model_name='socialuser',
            name='profile_picture',
            field=models.ImageField(default='unknown.png', upload_to='profile_pictures'),
        ),
    ]
