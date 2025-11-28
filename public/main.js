const socket = io();
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
});

// Participants display
const participantsDiv = document.createElement("div");
participantsDiv.id = "participants";
participantsDiv.style.margin = "10px";
participantsDiv.style.fontSize = "18px";
document.body.appendChild(participantsDiv);

let localStream;
let isMuted = false;
let isDeafened = false;

let username = prompt("Enter your name:", "Omar"); // Ecrin هتكتب اسمها لما تدخل
socket.emit("join", username);

// Update participants
socket.on("participants", (users) => {
  participantsDiv.innerText = "Participants: " + users.join(", ");
});

// Start Call button
const startBtn = document.getElementById("startCall");
startBtn.onclick = async () => {
  startBtn.innerText = "In Call ❤️";

  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

  let offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit("offer", offer);
};

// Mute button
const muteBtn = document.createElement("button");
muteBtn.innerText = "Mute";
muteBtn.style.margin = "5px";
document.body.appendChild(muteBtn);

muteBtn.onclick = () => {
  if (!localStream) return;
  isMuted = !isMuted;
  localStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
  muteBtn.innerText = isMuted ? "Unmute" : "Mute";
};

// Deafen button
const deafenBtn = document.createElement("button");
deafenBtn.innerText = "Deafen";
deafenBtn.style.margin = "5px";
document.body.appendChild(deafenBtn);

deafenBtn.onclick = () => {
  isDeafened = !isDeafened;
  pc.getReceivers().forEach(r => {
    if (r.track && r.track.kind === "audio") r.track.enabled = !isDeafened;
  });
  deafenBtn.innerText = isDeafened ? "Undeafen" : "Deafen";
};

// WebRTC signaling
pc.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit("ice-candidate", event.candidate);
  }
};

pc.ontrack = (event) => {
  let audio = document.createElement("audio");
  audio.srcObject = event.streams[0];
  audio.autoplay = true;
  document.body.appendChild(audio);
};

// Handle offer from other
socket.on("offer", async (offer) => {
  await pc.setRemoteDescription(offer);
  let answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit("answer", answer);
});

socket.on("answer", async (answer) => {
  await pc.setRemoteDescription(answer);
});

socket.on("ice-candidate", async (candidate) => {
  try { await pc.addIceCandidate(candidate); } catch (e) {}
});
