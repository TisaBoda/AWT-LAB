from django.contrib import admin
from .models import Student, Course, Subject, Grade, Attendance

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['roll_number', 'first_name', 'last_name', 'course', 'year', 'status']
    list_filter = ['status', 'course', 'year']
    search_fields = ['first_name', 'last_name', 'roll_number', 'email']

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'duration_years']

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'course', 'year']

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ['student', 'subject', 'marks_obtained']

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'date', 'status']
