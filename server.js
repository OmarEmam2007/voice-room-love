const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 8080;

app.use(express.static("public"));

let participants = [];

io.on("connection", (socket) => {

  // Join event
  socket.on("join", (username) => {
    socket.username = username;
    participants.push(username);
    io.emit("participants", participants);
  });

  // Disconnect event
  socket.on("disconnect", () => {
    participants = participants.filter(u => u !== socket.username);
    io.emit("participants", participants);
  });

  // WebRTC signaling
  socket.on("offer", (offer) => socket.broadcast.emit("offer", offer));
  socket.on("answer", (answer) => socket.broadcast.emit("answer", answer));
  socket.on("ice-candidate", (candidate) => socket.broadcast.emit("ice-candidate", candidate));
});

http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
