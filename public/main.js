const socket = io();
let pc = new RTCPeerConnection();

pc.onicecandidate = (e) => {
    if (e.candidate) socket.emit("ice-candidate", e.candidate);
};

pc.ontrack = (e) => {
    let audio = new Audio();
    audio.srcObject = e.streams[0];
    audio.play();
};

document.getElementById("startCall").onclick = async () => {

    document.querySelector(".start-btn").innerText = "Connecting… ❤️";

    let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    let offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("offer", offer);
};

socket.on("offer", async (offer) => {
    let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    let answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer", answer);
});

socket.on("answer", (answer) => {
    pc.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on("ice-candidate", (candidate) => {
    pc.addIceCandidate(new RTCIceCandidate(candidate));
});
