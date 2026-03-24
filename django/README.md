# Django Event Tracker

A Django version of the event tracking project.

## Features
- Username-based login (simple session login)
- Dashboard with recent events
- Purchase tracking
- Profile update tracking
- Logout tracking
- Event storage in SQLite
- Event export/appending in CSV file at `data/events.csv`
- Improved CSS styling
- No JSON summary link on dashboard

## Setup
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python run.py migrate
python run.py runserver
```

Open: `http://127.0.0.1:8000/`

## Notes
- Database used: SQLite by default (`db.sqlite3`)
- CSV file is auto-created in `data/events.csv`
