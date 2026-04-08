from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# DATABASE CONFIG
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# MODEL
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    done = db.Column(db.Boolean, default=False)

    def __init__(self, name, done=False):
        self.name = name
        self.done = done

# CREATE DB
with app.app_context():
    db.create_all()

# HOME
@app.route('/')
def home():
    tasks = Task.query.all()
    return render_template('index.html', tasks=tasks)

# ADD TASK
@app.route('/add', methods=['POST'])
def add_task():
    task_name = request.form.get('task')

    if task_name:
        new_task = Task(task_name)
        db.session.add(new_task)
        db.session.commit()

    return redirect(url_for('home'))

# VIEW TASK
@app.route('/task/<int:task_id>')
def view_task(task_id):
    task = db.session.get(Task, task_id)

    if not task:
        return "Task not found"

    return render_template('task.html', task=task)

# EDIT TASK
@app.route('/edit/<int:task_id>', methods=['GET', 'POST'])
def edit_task(task_id):
    task = db.session.get(Task, task_id)

    if not task:
        return "Task not found"

    if request.method == 'POST':
        task.name = request.form.get('task')
        db.session.commit()
        return redirect(url_for('home'))

    return render_template('edit.html', task=task)

# MARK DONE
@app.route('/done/<int:task_id>')
def mark_done(task_id):
    task = db.session.get(Task, task_id)

    if not task:
        return "Task not found"

    task.done = not task.done
    db.session.commit()

    return redirect(url_for('home'))

# DELETE TASK
@app.route('/delete/<int:task_id>')
def delete_task(task_id):
    task = db.session.get(Task, task_id)

    if not task:
        return "Task not found"

    db.session.delete(task)
    db.session.commit()

    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)