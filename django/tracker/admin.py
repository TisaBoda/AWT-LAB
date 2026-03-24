from django.contrib import admin
from .models import AppUser, Event

@admin.register(AppUser)
class AppUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'created_at')
    search_fields = ('username',)

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'event_type', 'details', 'event_time', 'source')
    list_filter = ('event_type', 'source')
    search_fields = ('username__username', 'details')
