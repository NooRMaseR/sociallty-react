from django.db import models
from users.models import SocialUser

class Report(models.Model):
    """
    Model to represent a report made by a user.
    """
    user_reported = models.ForeignKey(
        SocialUser,
        on_delete=models.CASCADE,
        related_name="reports"
    )
    user = models.ForeignKey(
        SocialUser,
        on_delete=models.CASCADE,
        related_name="reported_by"
    )
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Report by {self.user_reported.username} to {self.user.username}"

    class Meta:
        unique_together = ("user_reported", "user")
