const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

let tasks = [];

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/tasks", (req, res) => {
  const task = {
    id: Date.now(),
    title: req.body.title,
    completed: false,
    createdAt: new Date().toISOString()
  };
  tasks.push(task);
  res.json(task);
});

app.put("/tasks/:id", (req, res) => {
  tasks = tasks.map(task =>
    task.id == req.params.id
      ? { ...task, completed: true }
      : task
  );
  res.json({ message: "Task completed" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:3000`);
});
