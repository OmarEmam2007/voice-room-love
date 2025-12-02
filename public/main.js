const socket = io();

// UI Elements
const joinForm = document.getElementById("join-form");
const callControls = document.getElementById("call-controls");
const usernameInput = document.getElementById("username");
const roomNameInput = document.getElementById("roomName");
const joinRoomBtn = document.getElementById("joinRoom");
const startBtn = document.getElementById("startCall");
const muteBtn = document.getElementById("muteBtn");
const deafenBtn = document.getElementById("deafenBtn");
const roomInfo = document.getElementById("room-info");
const participantsInfo = document.getElementById("participants-info");
const callStatus = document.getElementById("call-status");

let pc; // PeerConnection will be created after joining the room
let localStream;
let isMuted = false;
let isDeafened = false;
let currentUsername;
let currentRoom;

// --- WebRTC Configuration (The Fix) ---
// Multiple STUN servers and a TURN server for robust connection
const iceServersConfig = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.stunprotocol.org" },
    // TURN server for relaying data when P2P fails (e.g., restricted networks/firewalls)
    { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" }
];

function createPeerConnection() {
    pc = new RTCPeerConnection({ iceServers: iceServersConfig });

    // WebRTC signaling
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit("ice-candidate", event.candidate);
        }
    };

    pc.ontrack = (event) => {
        // Only add audio track if it's not already added
        if (event.track.kind === 'audio' && !document.getElementById(`remote-audio-${event.streams[0].id}`)) {
            let audio = document.createElement("audio");
            audio.id = `remote-audio-${event.streams[0].id}`;
            audio.srcObject = event.streams[0];
            audio.autoplay = true;
            audio.style.display = 'none'; // Keep it hidden
            document.body.appendChild(audio);
            callStatus.innerText = "Connected! You can hear each other. ❤️";
        }
    };
}

// --- UI and Room Logic ---

joinRoomBtn.onclick = () => {
    currentUsername = usernameInput.value.trim();
    currentRoom = roomNameInput.value.trim();

    if (currentUsername && currentRoom) {
        socket.emit("join", { username: currentUsername, roomName: currentRoom });
        joinForm.style.display = "none";
        callControls.style.display = "block";
        roomInfo.innerText = `Room: ${currentRoom}`;
        callStatus.innerText = "Joined room. Click 'Start Call' to connect.";
        createPeerConnection(); // Initialize PC after joining
    } else {
        alert("Please enter both your name and a room name.");
    }
};

// Update participants
socket.on("participants", (users) => {
    participantsInfo.innerText = "Participants: " + users.join(", ");
});

// Start Call button
startBtn.onclick = async () => {
    try {
        startBtn.innerText = "Connecting...";
        startBtn.disabled = true;
        callStatus.innerText = "Requesting microphone access...";

        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

        callStatus.innerText = "Creating connection offer...";
        let offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", offer);
        startBtn.innerText = "In Call ❤️";
        callStatus.innerText = "Waiting for the other person to connect...";

    } catch (error) {
        console.error("Error starting call:", error);
        callStatus.innerText = "Error: Could not access microphone. Please check permissions.";
        startBtn.innerText = "Start Call ❤️";
        startBtn.disabled = false;
    }
};

// Mute button
muteBtn.onclick = () => {
    if (!localStream) return;
    isMuted = !isMuted;
    localStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
    muteBtn.innerText = isMuted ? "Unmute (Muted)" : "Mute";
    muteBtn.classList.toggle('active', isMuted);
};

// Deafen button
deafenBtn.onclick = () => {
    if (!pc) return;
    isDeafened = !isDeafened;
    // Mute all remote audio tracks
    document.querySelectorAll('audio[id^="remote-audio-"]').forEach(audio => {
        audio.muted = isDeafened;
    });
    deafenBtn.innerText = isDeafened ? "Undeafen (Deafened)" : "Deafen";
    deafenBtn.classList.toggle('active', isDeafened);
};

// --- WebRTC Signaling Handlers ---

// Handle offer from other
socket.on("offer", async (offer) => {
    if (!pc) createPeerConnection(); // Ensure PC is created if not already

    try {
        if (!localStream) {
            // Get local stream if not already
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
        }

        await pc.setRemoteDescription(offer);
        let answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", answer);
        startBtn.innerText = "In Call ❤️";
        startBtn.disabled = true;
        callStatus.innerText = "Connected! You can hear each other. ❤️";

    } catch (error) {
        console.error("Error handling offer:", error);
    }
});

socket.on("answer", async (answer) => {
    try {
        await pc.setRemoteDescription(answer);
        callStatus.innerText = "Connected! You can hear each other. ❤️";
    } catch (error) {
        console.error("Error handling answer:", error);
    }
});

socket.on("ice-candidate", async (candidate) => {
    try {
        if (pc) await pc.addIceCandidate(candidate);
    } catch (e) {
        console.error("Error adding received ice candidate:", e);
    }
});

// Simple heart animation for extra touch
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerText = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 2 + 3 + 's'; // 3 to 5 seconds
    heart.style.fontSize = Math.random() * 10 + 15 + 'px';
    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 5000);
}

setInterval(createHeart, 300); // Create a new heart every 300ms
