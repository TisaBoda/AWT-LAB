const socket = io();

function triggerEvent(type) {
    const username = document.getElementById("username").value || "Anonymous";
    const item = document.getElementById("item").value || "None";
    
    socket.emit("trigger-event", { type, username, item });
}

function getSummary() {
    socket.emit("get-summary");
}

socket.on("summary", (data) => {
    let summaryDiv = document.getElementById("summary");
    summaryDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
});
