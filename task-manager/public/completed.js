const completedList = document.getElementById("completedList");

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString();
}

fetch("/tasks")
  .then(res => res.json())
  .then(tasks => {
    tasks
      .filter(task => task.completed)
      .forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = `
          <div>
            <strong>${task.title}</strong><br>
            <small>${formatDateTime(task.createdAt)}</small>
          </div>
        `;
        completedList.appendChild(li);
      });
  });
