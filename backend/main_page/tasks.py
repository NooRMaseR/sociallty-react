from celery import shared_task
from django.core.management import call_command


@shared_task
def delete_unused_media():
    """
    Task to delete old posts that has been Deleted from the database.
    """
    call_command("deleteorphanedmedia", no_input=True)