from django.db import models

class AppUser(models.Model):
    username = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

class Event(models.Model):
    EVENT_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('purchase', 'Purchase'),
        ('profile-update', 'Profile Update'),
    ]

    username = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='events', to_field='username', db_column='username')
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    details = models.CharField(max_length=255, blank=True, null=True)
    event_time = models.DateTimeField(auto_now_add=True)
    source = models.CharField(max_length=20, default='app')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-event_time']

    def __str__(self):
        return f'{self.username} - {self.event_type}'
