import csv
from pathlib import Path

from django.conf import settings
from django.shortcuts import redirect, render
from django.utils import timezone

from .models import AppUser, Event

CSV_PATH = Path(settings.BASE_DIR) / 'data' / 'events.csv'


def ensure_csv_file():
    CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not CSV_PATH.exists():
        CSV_PATH.write_text('timestamp,username,event_type,details\n')


def append_event_to_csv(username, event_type, details, timestamp):
    ensure_csv_file()
    with CSV_PATH.open('a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow([
            timestamp.isoformat(),
            username,
            event_type,
            details or '',
        ])


def save_event(username, event_type, details=''):
    user, _ = AppUser.objects.get_or_create(username=username)
    event = Event.objects.create(
        username=user,
        event_type=event_type,
        details=details,
        source='app',
    )
    append_event_to_csv(username, event_type, details, timezone.localtime(event.event_time))
    return event


def get_logged_in_username(request):
    return request.session.get('username')


def require_username(request):
    username = get_logged_in_username(request)
    if not username:
        return None
    return username


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        if username:
            request.session['username'] = username
            save_event(username, 'login', 'user logged in')
            return redirect('dashboard')
        return render(request, 'tracker/login.html', {'error': 'Username is required.'})
    return render(request, 'tracker/login.html')


def dashboard_view(request):
    username = require_username(request)
    if not username:
        return redirect('login')
    recent_events = Event.objects.filter(username__username=username)[:10]
    return render(request, 'tracker/dashboard.html', {
        'username': username,
        'recent_events': recent_events,
    })


def purchase_view(request):
    username = require_username(request)
    if not username:
        return redirect('login')
    if request.method == 'POST':
        item = request.POST.get('item', '').strip()
        if item:
            save_event(username, 'purchase', item)
            return redirect('dashboard')
        return render(request, 'tracker/purchase.html', {'username': username, 'error': 'Item name is required.'})
    return render(request, 'tracker/purchase.html', {'username': username})


def profile_view(request):
    username = require_username(request)
    if not username:
        return redirect('login')
    if request.method == 'POST':
        field = request.POST.get('field', '').strip()
        if field:
            save_event(username, 'profile-update', field)
            return redirect('dashboard')
        return render(request, 'tracker/profile.html', {'username': username, 'error': 'Field name is required.'})
    return render(request, 'tracker/profile.html', {'username': username})


def logout_view(request):
    username = get_logged_in_username(request)
    if username:
        save_event(username, 'logout', 'user logged out')
    request.session.flush()
    return redirect('login')
