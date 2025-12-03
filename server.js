const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

let crashValue = "No value yet";

// -------------------------------
// CONNECT TO YOUR WEBSOCKET
// -------------------------------
function connectWebSocket() {
    const ws = new WebSocket("wss://srv1014265.hstgr.cloud:8080/30/8/19?co=3163&cu=9472&lg=en&wh=5288&ipm=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1MFwvMTI4NDM4NjIyNSIsInBpZCI6IjEiLCJqdGkiOiJpcG1fNjkxNWQwYmIxMWI5MjMuODgwOTcyNTMiLCJhcHAiOiJOQSIsImlubmVyIjoidHJ1ZSIsIm5iZiI6MTc2MzAzNzM3MSwiaWF0IjoxNzYzMDM3MzcxLCJleHAiOjE3NjMwNDA5NzF9.QB8fI__AxxnvglZYsZ-Qh2p2XT_krEWrTmOhRmloTXQ&tok=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI5OTk5OTk5Iiwicm9sZSI6IlRoYW5vcyIsImlhdCI6MTc2MzAzNzM3MSwiZXhwIjoxNzYzMDM3NDMxfQ.pACEmEtHs3IslxCeq4F-dnXH16X1yfOFh7Db8aW4l6A");

    ws.on("open", () => {
        ws.send('{"protocol":"json","version":1}\x1e');
        console.log("WebSocket connected");
    });

    ws.on("message", (msg) => {
        try {
            const data = JSON.parse(msg.toString().slice(0, -1));

            if (data.oncrash) {
                crashValue = data.oncrash.toString() + "x";
                console.log("Crash value updated:", crashValue);
            }
        } catch (e) {
            console.log("Error parsing message:", e);
        }
    });

    ws.on("close", () => {
        console.log("WebSocket closed. Reconnecting in 3 seconds...");
        setTimeout(connectWebSocket, 3000);
    });

    ws.on("error", (err) => {
        console.log("WebSocket error", err);
    });
}

connectWebSocket();

// -------------------------------
// API ENDPOINTS
// -------------------------------

// GET crashValue (Sketchware will use this)
app.get("/crash", (req, res) => {
    res.send(crashValue);
});

// POST update crashValue (Optional)
app.post("/update", (req, res) => {
    if (req.body.crashValue) {
        crashValue = req.body.crashValue;
        res.send("OK");
    } else {
        res.send("Missing crashValue");
    }
});

// -------------------------------
// START SERVER
// -------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
