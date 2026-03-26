# EduTrack — Django Student Management System

A full-featured student management system built with Django, featuring a sleek dark UI.

## Features

- **Dashboard** — stats overview, status breakdown, recent students
- **Students** — full CRUD, photo upload, search & filter by course/year/status
- **Courses** — manage programs with enrollment counts
- **Grades** — per-subject marks with automatic grade letters (A+→F)
- **Attendance** — daily tracking with present/absent/late/excused, percentage summary
- **Admin Panel** — Django admin at `/admin/`

## Quick Start

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run migrations
```bash
python manage.py makemigrations students
python manage.py migrate
```

### 3. Create superuser (for admin panel)
```bash
python manage.py createsuperuser
```

### 4. (Optional) Load sample data
```bash
python seed_data.py
```
This creates 3 courses, 8 students, grades, and attendance records.

### 5. Start the server
```bash
python manage.py runserver
```

Visit: **http://127.0.0.1:8000**

Admin: **http://127.0.0.1:8000/admin**

## Project Structure

```
student_management/
├── manage.py
├── requirements.txt
├── seed_data.py          ← Sample data loader
├── sms/                  ← Django project config
│   ├── settings.py
│   └── urls.py
└── students/             ← Main application
    ├── models.py         ← Student, Course, Subject, Grade, Attendance
    ├── views.py          ← CRUD views for all models
    ├── urls.py           ← URL routing
    ├── forms.py          ← Django forms
    ├── admin.py          ← Admin configuration
    └── templates/
        └── students/
            ├── base.html
            ├── dashboard.html
            ├── student_list.html
            ├── student_detail.html
            ├── student_form.html
            ├── course_list.html
            ├── grade_list.html
            └── attendance_list.html
```

## URL Routes

| URL | View |
|-----|------|
| `/` | Dashboard |
| `/students/` | Student list |
| `/students/add/` | Add student |
| `/students/<id>/` | Student detail |
| `/students/<id>/edit/` | Edit student |
| `/courses/` | Course list |
| `/courses/add/` | Add course |
| `/grades/` | Grade list |
| `/grades/add/` | Add grade |
| `/attendance/` | Attendance list |
| `/attendance/add/` | Mark attendance |
| `/admin/` | Django admin |
