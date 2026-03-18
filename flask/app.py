from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

tasks = []

@app.route('/')
def home():
    return render_template('index.html', tasks=tasks)

# ADD TASK
@app.route('/add', methods=['POST'])
def add_task():
    task_name = request.form.get('task')

    if task_name:
        tasks.append({
            'id': len(tasks) + 1,
            'name': task_name,
            'done': False
        })

    return redirect(url_for('home'))

# ✅ DYNAMIC URL → VIEW SINGLE TASK
@app.route('/task/<int:task_id>')
def view_task(task_id):
    for task in tasks:
        if task['id'] == task_id:
            return render_template('task.html', task=task)
    
    return "Task not found"

# MARK DONE (dynamic)
@app.route('/done/<int:task_id>')
def mark_done(task_id):
    for task in tasks:
        if task['id'] == task_id:
            task['done'] = not task['done']
            break
    return redirect(url_for('home'))

# DELETE (dynamic)
@app.route('/delete/<int:task_id>')
def delete_task(task_id):
    global tasks
    tasks = [task for task in tasks if task['id'] != task_id]
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)