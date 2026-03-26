from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.db.models import Q, Count, Avg
from django.http import JsonResponse
from .models import Student, Course, Subject, Grade, Attendance
from .forms import StudentForm, CourseForm, SubjectForm, GradeForm, AttendanceForm, StudentFilterForm


def dashboard(request):
    total_students = Student.objects.count()
    active_students = Student.objects.filter(status='active').count()
    total_courses = Course.objects.count()
    total_subjects = Subject.objects.count()

    course_data = Course.objects.annotate(student_count=Count('students')).order_by('-student_count')[:5]
    recent_students = Student.objects.select_related('course').order_by('-created_at')[:5]

    status_counts = {
        'active': Student.objects.filter(status='active').count(),
        'inactive': Student.objects.filter(status='inactive').count(),
        'graduated': Student.objects.filter(status='graduated').count(),
        'suspended': Student.objects.filter(status='suspended').count(),
    }

    year_data = Student.objects.values('year').annotate(count=Count('id')).order_by('year')

    context = {
        'total_students': total_students,
        'active_students': active_students,
        'total_courses': total_courses,
        'total_subjects': total_subjects,
        'course_data': course_data,
        'recent_students': recent_students,
        'status_counts': status_counts,
        'year_data': year_data,
    }
    return render(request, 'students/dashboard.html', context)


# ─── Students ───────────────────────────────────────────────────────────────

def student_list(request):
    form = StudentFilterForm(request.GET)
    students = Student.objects.select_related('course').all()

    if form.is_valid():
        search = form.cleaned_data.get('search')
        course = form.cleaned_data.get('course')
        year = form.cleaned_data.get('year')
        status = form.cleaned_data.get('status')

        if search:
            students = students.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(roll_number__icontains=search) |
                Q(email__icontains=search)
            )
        if course:
            students = students.filter(course=course)
        if year:
            students = students.filter(year=year)
        if status:
            students = students.filter(status=status)

    return render(request, 'students/student_list.html', {
        'students': students,
        'filter_form': form,
        'total': students.count(),
    })


def student_detail(request, pk):
    student = get_object_or_404(Student, pk=pk)
    grades = student.grades.select_related('subject').all()
    attendances = student.attendances.select_related('subject').order_by('-date')[:30]
    attendance_pct = 0
    if student.attendances.exists():
        present = student.attendances.filter(status__in=['present', 'late']).count()
        total = student.attendances.count()
        attendance_pct = round((present / total) * 100, 1)

    return render(request, 'students/student_detail.html', {
        'student': student,
        'grades': grades,
        'attendances': attendances,
        'attendance_pct': attendance_pct,
    })


def student_create(request):
    if request.method == 'POST':
        form = StudentForm(request.POST, request.FILES)
        if form.is_valid():
            student = form.save()
            messages.success(request, f'Student {student.full_name} added successfully!')
            return redirect('student_detail', pk=student.pk)
    else:
        form = StudentForm()
    return render(request, 'students/student_form.html', {'form': form, 'title': 'Add Student'})


def student_edit(request, pk):
    student = get_object_or_404(Student, pk=pk)
    if request.method == 'POST':
        form = StudentForm(request.POST, request.FILES, instance=student)
        if form.is_valid():
            form.save()
            messages.success(request, 'Student updated successfully!')
            return redirect('student_detail', pk=pk)
    else:
        form = StudentForm(instance=student)
    return render(request, 'students/student_form.html', {'form': form, 'title': 'Edit Student', 'student': student})


def student_delete(request, pk):
    student = get_object_or_404(Student, pk=pk)
    if request.method == 'POST':
        name = student.full_name
        student.delete()
        messages.success(request, f'Student {name} deleted.')
        return redirect('student_list')
    return render(request, 'students/confirm_delete.html', {'object': student, 'type': 'Student'})


# ─── Courses ────────────────────────────────────────────────────────────────

def course_list(request):
    courses = Course.objects.annotate(student_count=Count('students')).all()
    return render(request, 'students/course_list.html', {'courses': courses})


def course_create(request):
    if request.method == 'POST':
        form = CourseForm(request.POST)
        if form.is_valid():
            course = form.save()
            messages.success(request, f'Course {course.name} created!')
            return redirect('course_list')
    else:
        form = CourseForm()
    return render(request, 'students/simple_form.html', {'form': form, 'title': 'Add Course'})


def course_edit(request, pk):
    course = get_object_or_404(Course, pk=pk)
    if request.method == 'POST':
        form = CourseForm(request.POST, instance=course)
        if form.is_valid():
            form.save()
            messages.success(request, 'Course updated!')
            return redirect('course_list')
    else:
        form = CourseForm(instance=course)
    return render(request, 'students/simple_form.html', {'form': form, 'title': 'Edit Course'})


def course_delete(request, pk):
    course = get_object_or_404(Course, pk=pk)
    if request.method == 'POST':
        course.delete()
        messages.success(request, 'Course deleted.')
        return redirect('course_list')
    return render(request, 'students/confirm_delete.html', {'object': course, 'type': 'Course'})


# ─── Grades ─────────────────────────────────────────────────────────────────

def grade_list(request):
    grades = Grade.objects.select_related('student', 'subject').all()
    return render(request, 'students/grade_list.html', {'grades': grades})


def grade_create(request):
    if request.method == 'POST':
        form = GradeForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Grade added!')
            return redirect('grade_list')
    else:
        form = GradeForm()
    return render(request, 'students/simple_form.html', {'form': form, 'title': 'Add Grade'})


def grade_edit(request, pk):
    grade = get_object_or_404(Grade, pk=pk)
    if request.method == 'POST':
        form = GradeForm(request.POST, instance=grade)
        if form.is_valid():
            form.save()
            messages.success(request, 'Grade updated!')
            return redirect('grade_list')
    else:
        form = GradeForm(instance=grade)
    return render(request, 'students/simple_form.html', {'form': form, 'title': 'Edit Grade'})


def grade_delete(request, pk):
    grade = get_object_or_404(Grade, pk=pk)
    if request.method == 'POST':
        grade.delete()
        messages.success(request, 'Grade deleted.')
        return redirect('grade_list')
    return render(request, 'students/confirm_delete.html', {'object': grade, 'type': 'Grade'})


# ─── Attendance ──────────────────────────────────────────────────────────────

def attendance_list(request):
    attendances = Attendance.objects.select_related('student', 'subject').order_by('-date')[:100]
    return render(request, 'students/attendance_list.html', {'attendances': attendances})


def attendance_create(request):
    if request.method == 'POST':
        form = AttendanceForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Attendance recorded!')
            return redirect('attendance_list')
    else:
        form = AttendanceForm()
    return render(request, 'students/simple_form.html', {'form': form, 'title': 'Mark Attendance'})


def attendance_delete(request, pk):
    att = get_object_or_404(Attendance, pk=pk)
    if request.method == 'POST':
        att.delete()
        messages.success(request, 'Attendance record deleted.')
        return redirect('attendance_list')
    return render(request, 'students/confirm_delete.html', {'object': att, 'type': 'Attendance'})
