import os, sys, django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sms.settings')
django.setup()

from students.models import Course, Subject, Student, Grade, Attendance
from datetime import date, timedelta
import random

print("Creating courses...")
cs = Course.objects.create(name="Computer Science", code="CS", duration_years=4, description="Bachelor of Computer Science & Engineering")
bba = Course.objects.create(name="Business Administration", code="BBA", duration_years=3, description="Bachelor of Business Administration")
mech = Course.objects.create(name="Mechanical Engineering", code="ME", duration_years=4, description="Bachelor of Mechanical Engineering")

print("Creating subjects...")
subjects = [
    Subject(name="Data Structures", code="CS101", course=cs, year=1, max_marks=100),
    Subject(name="Algorithms", code="CS102", course=cs, year=1, max_marks=100),
    Subject(name="Database Systems", code="CS201", course=cs, year=2, max_marks=100),
    Subject(name="Operating Systems", code="CS202", course=cs, year=2, max_marks=100),
    Subject(name="Marketing", code="BBA101", course=bba, year=1, max_marks=100),
    Subject(name="Accounting", code="BBA102", course=bba, year=1, max_marks=100),
    Subject(name="Thermodynamics", code="ME101", course=mech, year=1, max_marks=100),
    Subject(name="Fluid Mechanics", code="ME201", course=mech, year=2, max_marks=100),
]
Subject.objects.bulk_create(subjects)

print("Creating students...")
students_data = [
    ("Arjun", "Sharma", "CS2024001", "arjun.sharma@student.edu", "+919876543210", cs, 1, "active"),
    ("Priya", "Patel", "CS2024002", "priya.patel@student.edu", "+919876543211", cs, 1, "active"),
    ("Ravi", "Kumar", "CS2023001", "ravi.kumar@student.edu", "+919876543212", cs, 2, "active"),
    ("Sneha", "Mehta", "BBA2024001", "sneha.mehta@student.edu", "+919876543213", bba, 1, "active"),
    ("Karan", "Joshi", "BBA2024002", "karan.joshi@student.edu", "+919876543214", bba, 1, "inactive"),
    ("Ananya", "Singh", "ME2024001", "ananya.singh@student.edu", "+919876543215", mech, 1, "active"),
    ("Rohit", "Verma", "CS2022001", "rohit.verma@student.edu", "+919876543216", cs, 3, "graduated"),
    ("Deepa", "Nair", "BBA2022001", "deepa.nair@student.edu", "+919876543217", bba, 2, "active"),
]

created_students = []
for fn, ln, roll, email, phone, course, year, status in students_data:
    s = Student.objects.create(
        first_name=fn, last_name=ln, roll_number=roll, email=email,
        phone=phone, course=course, year=year, status=status,
        admission_date=date(2024, 7, 1), city="Ahmedabad", state="Gujarat",
        parent_name=f"{fn}'s Parent", parent_phone=phone
    )
    created_students.append(s)

print("Adding grades...")
cs_subjects = list(Subject.objects.filter(course=cs, year=1))
for student in created_students[:3]:
    for subj in Subject.objects.filter(course=student.course, year=student.year):
        marks = random.randint(45, 98)
        Grade.objects.create(student=student, subject=subj, marks_obtained=marks, exam_date=date(2024, 11, 15))

print("Adding attendance...")
base_date = date.today() - timedelta(days=10)
statuses = ['present','present','present','present','present','late','absent']
for student in created_students[:4]:
    for i in range(10):
        d = base_date + timedelta(days=i)
        if d.weekday() < 5:
            Attendance.objects.get_or_create(
                student=student, date=d,
                defaults={'status': random.choice(statuses)}
            )

print("✓ Sample data created successfully!")
print(f"  Courses: {Course.objects.count()}")
print(f"  Students: {Student.objects.count()}")
print(f"  Grades: {Grade.objects.count()}")
print(f"  Attendance records: {Attendance.objects.count()}")
