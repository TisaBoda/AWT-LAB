from django.shortcuts import render, redirect, get_object_or_404
from .models import Student

def student_list(request):
    students = Student.objects.all()
    return render(request, 'students/student_list.html', {'students': students})

def add_student(request):
    if request.method == 'POST':
        Student.objects.create(
            name=request.POST['name'],
            roll_no=request.POST['roll_no'],
            email=request.POST['email'],
            course=request.POST['course'],
            age=request.POST['age']
        )
        return redirect('student_list')
    return render(request, 'students/student_form.html')

def delete_student(request, pk):
    student = get_object_or_404(Student, pk=pk)
    student.delete()
    return redirect('student_list')
