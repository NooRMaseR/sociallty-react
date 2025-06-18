from unfold.admin import ModelAdmin
from django.contrib import admin
from .models import Report

# Register your models here.
@admin.register(Report)
class ReportAdmin(ModelAdmin):
    list_display = ('user_reported', 'user', 'reason', 'created_at')
    search_fields = ('user_reported__username', 'user__username')
    search_help_text = "Search by username of the reported user or the user who made the report."
    list_filter = ('created_at', 'user')
    ordering = ('-created_at',)
    list_per_page = 50