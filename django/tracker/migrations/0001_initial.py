from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='AppUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=100, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_type', models.CharField(choices=[('login', 'Login'), ('logout', 'Logout'), ('purchase', 'Purchase'), ('profile-update', 'Profile Update')], max_length=50)),
                ('details', models.CharField(blank=True, max_length=255, null=True)),
                ('event_time', models.DateTimeField(auto_now_add=True)),
                ('source', models.CharField(default='app', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('username', models.ForeignKey(db_column='username', on_delete=django.db.models.deletion.CASCADE, related_name='events', to='tracker.appuser', to_field='username')),
            ],
            options={'ordering': ['-event_time']},
        ),
    ]
