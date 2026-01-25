const express = require("express");
const http = require("http");
const { EventEmitter } = require("events");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

const eventEmitter = new EventEmitter();

const eventCounts = {
    "user-login": 0,
    "user-logout": 0,
    "user-purchase": 0,
    "profile-update": 0
};

eventEmitter.on("user-login", (username) => {
    eventCounts["user-login"]++;
    console.log(`${username} logged in`);
});

eventEmitter.on("user-logout", (username) => {
    eventCounts["user-logout"]++;
    console.log(`${username} logged out`);
});

eventEmitter.on("user-purchase", (username, item) => {
    eventCounts["user-purchase"]++;
    console.log(`${username} purchased ${item}`);
});

eventEmitter.on("profile-update", (username) => {
    eventCounts["profile-update"]++;
    console.log(`${username} updated profile`);
});

eventEmitter.on("summary", () => {
    console.log("----- Event Summary -----");
    console.table(eventCounts);
    io.emit("summary", eventCounts); 
});

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("trigger-event", (data) => {
        const { type, username, item } = data;
        if (type === "user-login") eventEmitter.emit("user-login", username);
        if (type === "user-logout") eventEmitter.emit("user-logout", username);
        if (type === "user-purchase") eventEmitter.emit("user-purchase", username, item);
        if (type === "profile-update") eventEmitter.emit("profile-update", username);
    });

    socket.on("get-summary", () => {
        eventEmitter.emit("summary");
    });
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});



