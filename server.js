const express = require("express");
const app = express();
const http = require("http" ).createServer(app);
const io = require("socket.io")(http );

const PORT = process.env.PORT || 8080;

app.use(express.static("public"));

// Store participants by room: { 'roomName': [{ id: socket.id, username: 'name' }, ...] }
let rooms = {};

function getParticipantsInRoom(roomName) {
  return rooms[roomName] ? rooms[roomName].map(p => p.username) : [];
}

io.on("connection", (socket) => {

  let currentRoom = null;
  let currentUsername = null;

  // Join event
  socket.on("join", ({ username, roomName }) => {
    if (!username || !roomName) return;

    currentUsername = username;
    currentRoom = roomName;

    // Join the socket.io room
    socket.join(currentRoom);

    // Add participant to our custom room structure
    if (!rooms[currentRoom]) {
      rooms[currentRoom] = [];
    }
    rooms[currentRoom].push({ id: socket.id, username: currentUsername });

    // Emit updated participant list to everyone in the room
    io.to(currentRoom).emit("participants", getParticipantsInRoom(currentRoom));
    console.log(`${currentUsername} joined room ${currentRoom}`);
  });

  // Disconnect event
  socket.on("disconnect", () => {
    if (currentRoom && currentUsername) {
      // Remove participant from the room structure
      rooms[currentRoom] = rooms[currentRoom].filter(p => p.id !== socket.id);

      // Clean up empty room
      if (rooms[currentRoom].length === 0) {
        delete rooms[currentRoom];
      } else {
        // Emit updated participant list to the remaining in the room
        io.to(currentRoom).emit("participants", getParticipantsInRoom(currentRoom));
      }
      console.log(`${currentUsername} left room ${currentRoom}`);
    }
  });

  // WebRTC signaling - broadcast to all others in the same room
  socket.on("offer", (offer) => socket.to(currentRoom).emit("offer", offer));
  socket.on("answer", (answer) => socket.to(currentRoom).emit("answer", answer));
  socket.on("ice-candidate", (candidate) => socket.to(currentRoom).emit("ice-candidate", candidate));
});

http.listen(PORT, ( ) => console.log(`Server running on port ${PORT}`));
