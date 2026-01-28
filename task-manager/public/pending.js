const pendingList = document.getElementById("pendingList");

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString();
}

function loadPending() {
  pendingList.innerHTML = "";

  fetch("/tasks")
    .then(res => res.json())
    .then(tasks => {
      tasks
        .filter(task => !task.completed)
        .forEach(task => {
          const li = document.createElement("li");

          li.innerHTML = `
            <label>
              <input type="checkbox" onchange="completeTask(${task.id})">
              <span>
                <strong>${task.title}</strong><br>
                <small>${formatDateTime(task.createdAt)}</small>
              </span>
            </label>
          `;

          pendingList.appendChild(li);
        });
    });
}

function completeTask(id) {
  fetch(`/tasks/${id}`, { method: "PUT" })
    .then(() => loadPending());
}

loadPending();
