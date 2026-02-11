
const db = require("./db");
const express = require("express");
const EventEmitter = require("events");
const path = require("path");
const fs = require("fs");

const app = express();
const emitter = new EventEmitter();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUser = "";

const eventCount = {
  login: 0,
  logout: 0,
  purchase: 0,
  profile: 0
};

const dataDir = path.join(__dirname, "data");
const csvFile = path.join(dataDir, "events.csv");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

if (!fs.existsSync(csvFile)) {
  fs.writeFileSync(
    csvFile,
    "timestamp,username,event,details\n"
  );
}

function saveToCSV(username, event, details) {
  const time = new Date().toISOString();
  const row = `${time},${username},${event},${details}\n`;
  fs.appendFileSync(csvFile, row);
}

function saveEventToDB(username, event, details) {
  const sql = `
    INSERT INTO events (username, event_type, details)
    VALUES (?, ?, ?)
  `;
  db.query(sql, [username, event, details], (err) => {
    if (err) {
      console.error("Error saving event:", err);
    }
  });
}

function printEventTable() {
  console.log("\nFINAL EVENT SUMMARY");
  console.table({
    "Login Events": eventCount.login,
    "Logout Events": eventCount.logout,
    "Purchase Events": eventCount.purchase,
    "Profile Update Events": eventCount.profile
  });
}

emitter.on("login", (u) => {
  eventCount.login++;
  console.log(u + " logged in");

  // insert user if not exists
  db.query(
    "INSERT IGNORE INTO users (username) VALUES (?)",
    [u]
  );

  saveEventToDB(u, "login", "user logged in");
});

emitter.on("logout", (u) => {
  eventCount.logout++;
  console.log(u + " logged out");
  saveEventToDB(u, "logout", "user logged out");
});

emitter.on("purchase", (u, item) => {
  eventCount.purchase++;
  console.log(u + " purchased " + item);
  saveEventToDB(u, "purchase", item);
});

emitter.on("profile", (u, field) => {
  eventCount.profile++;
  console.log(u + " updated " + field);
  saveEventToDB(u, "profile-update", field);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/login.html"));
});

app.post("/login", (req, res) => {
  currentUser = req.body.username;
  emitter.emit("login", currentUser);
  res.sendFile(path.join(__dirname, "views/dashboard.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "views/dashboard.html"));
});

app.get("/purchase", (req, res) => {
  res.sendFile(path.join(__dirname, "views/purchase.html"));
});

app.post("/purchase", (req, res) => {
  emitter.emit("purchase", currentUser, req.body.item);
  res.redirect("/dashboard");
});

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "views/profile.html"));
});

app.post("/profile", (req, res) => {
  emitter.emit("profile", currentUser, req.body.field);
  res.redirect("/dashboard");
});

app.get("/logout", (req, res) => {
  emitter.emit("logout", currentUser);
  printEventTable(); 
  currentUser = "";
  res.redirect("/");
});

app.get("/summary", (req, res) => {
  db.query(
    "SELECT event_type, COUNT(*) as count FROM events GROUP BY event_type",
    (err, results) => {
      if (err) {
        return res.send("Error fetching summary");
      }

      res.send(`
        <div class="container">
          <h2>Event Summary</h2>
          <pre>${JSON.stringify(results, null, 2)}</pre>
          <a href="/dashboard">Back</a>
        </div>
      `);
    }
  );
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

process.on("SIGINT", () => {
  printEventTable();
  process.exit();
});
