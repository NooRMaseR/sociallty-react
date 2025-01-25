# Generated by Django 5.1.2 on 2025-01-26 16:31

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0021_usercode'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usercode',
            name='code',
            field=models.SmallIntegerField(unique=True),
        ),
        migrations.CreateModel(
            name='SocialUserSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_private_account', models.BooleanField(default=False)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='settings', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
