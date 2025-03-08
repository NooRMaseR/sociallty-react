# Generated by Django 5.1.2 on 2025-03-10 19:56

from django.conf import settings
from django.db import migrations
from django.db.models import Count

def delete_dublicated_likes(app, schema_editor):
    Like = app.get_model("main_page", "Like")
    duplicates = (
        Like.objects.values("user", "post")
        .annotate(count=Count("id"))
        .filter(count__gt=1)
    )

    for entry in duplicates:
        Like.objects.filter(user=entry["user"], post=entry["post"]).exclude(id=Like.objects.filter(user=entry["user"], post=entry["post"]).earliest("id").id).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('main_page', '0021_alter_postcontent_image_alter_postcontent_video'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(delete_dublicated_likes),
        migrations.AlterUniqueTogether(
            name='like',
            unique_together={('user', 'post')},
        ),
    ]
