from django import forms
from .models import Student, Course, Subject, Grade, Attendance


class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = [
            'first_name', 'last_name', 'roll_number', 'email', 'phone',
            'date_of_birth', 'gender', 'photo', 'course', 'year',
            'admission_date', 'status', 'address', 'city', 'state',
            'parent_name', 'parent_phone', 'parent_email'
        ]
        widgets = {
            'first_name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'First Name'}),
            'last_name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Last Name'}),
            'roll_number': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'e.g. CS2024001'}),
            'email': forms.EmailInput(attrs={'class': 'form-input', 'placeholder': 'student@example.com'}),
            'phone': forms.TextInput(attrs={'class': 'form-input', 'placeholder': '+91XXXXXXXXXX'}),
            'date_of_birth': forms.DateInput(attrs={'class': 'form-input', 'type': 'date'}),
            'gender': forms.Select(attrs={'class': 'form-select'}),
            'photo': forms.FileInput(attrs={'class': 'form-file'}),
            'course': forms.Select(attrs={'class': 'form-select'}),
            'year': forms.NumberInput(attrs={'class': 'form-input', 'min': 1, 'max': 6}),
            'admission_date': forms.DateInput(attrs={'class': 'form-input', 'type': 'date'}),
            'status': forms.Select(attrs={'class': 'form-select'}),
            'address': forms.Textarea(attrs={'class': 'form-textarea', 'rows': 2, 'placeholder': 'Street Address'}),
            'city': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'City'}),
            'state': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'State'}),
            'parent_name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Parent / Guardian Name'}),
            'parent_phone': forms.TextInput(attrs={'class': 'form-input', 'placeholder': '+91XXXXXXXXXX'}),
            'parent_email': forms.EmailInput(attrs={'class': 'form-input', 'placeholder': 'parent@example.com'}),
        }


class CourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ['name', 'code', 'description', 'duration_years']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Course Name'}),
            'code': forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'e.g. CS, MBA'}),
            'description': forms.Textarea(attrs={'class': 'form-textarea', 'rows': 3}),
            'duration_years': forms.NumberInput(attrs={'class': 'form-input', 'min': 1}),
        }


class SubjectForm(forms.ModelForm):
    class Meta:
        model = Subject
        fields = ['name', 'code', 'course', 'year', 'max_marks']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-input'}),
            'code': forms.TextInput(attrs={'class': 'form-input'}),
            'course': forms.Select(attrs={'class': 'form-select'}),
            'year': forms.NumberInput(attrs={'class': 'form-input', 'min': 1}),
            'max_marks': forms.NumberInput(attrs={'class': 'form-input'}),
        }


class GradeForm(forms.ModelForm):
    class Meta:
        model = Grade
        fields = ['student', 'subject', 'marks_obtained', 'exam_date', 'remarks']
        widgets = {
            'student': forms.Select(attrs={'class': 'form-select'}),
            'subject': forms.Select(attrs={'class': 'form-select'}),
            'marks_obtained': forms.NumberInput(attrs={'class': 'form-input', 'min': 0}),
            'exam_date': forms.DateInput(attrs={'class': 'form-input', 'type': 'date'}),
            'remarks': forms.TextInput(attrs={'class': 'form-input'}),
        }


class AttendanceForm(forms.ModelForm):
    class Meta:
        model = Attendance
        fields = ['student', 'date', 'status', 'subject', 'notes']
        widgets = {
            'student': forms.Select(attrs={'class': 'form-select'}),
            'date': forms.DateInput(attrs={'class': 'form-input', 'type': 'date'}),
            'status': forms.Select(attrs={'class': 'form-select'}),
            'subject': forms.Select(attrs={'class': 'form-select'}),
            'notes': forms.TextInput(attrs={'class': 'form-input'}),
        }


class StudentFilterForm(forms.Form):
    search = forms.CharField(required=False, widget=forms.TextInput(attrs={
        'class': 'form-input', 'placeholder': 'Search by name, roll no, email...'
    }))
    course = forms.ModelChoiceField(queryset=Course.objects.all(), required=False,
                                    empty_label="All Courses",
                                    widget=forms.Select(attrs={'class': 'form-select'}))
    year = forms.ChoiceField(choices=[('', 'All Years')] + [(i, f'Year {i}') for i in range(1, 7)],
                             required=False,
                             widget=forms.Select(attrs={'class': 'form-select'}))
    status = forms.ChoiceField(choices=[('', 'All Status'), ('active', 'Active'),
                                        ('inactive', 'Inactive'), ('graduated', 'Graduated'),
                                        ('suspended', 'Suspended')],
                               required=False,
                               widget=forms.Select(attrs={'class': 'form-select'}))
