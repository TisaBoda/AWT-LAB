function addTask() {
  const input = document.getElementById("taskInput");
  if (input.value === "") return;

  fetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: input.value })
  }).then(() => {
    input.value = "";
    alert("Task added!");
  });
}
