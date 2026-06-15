const compliments = [
  "You light up every room with your smile.",
  "Your beauty is as graceful as a blooming rose.",
  "You have a heart that shines brighter than diamonds.",
  "Your presence makes the world softer and sweeter.",
  "You are charming, lovely, and unforgettable.",
  "Your confidence is your most beautiful glow.",
  "You make elegance look effortless.",
  "Your kindness adds magic to your beauty.",
  "You are a wonderful mix of strength and sweetness.",
  "Your smile is pure sunshine."
];

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const statusEl = document.getElementById("status");
const complimentEl = document.getElementById("compliment");
const startBtn = document.getElementById("startBtn");
const filterSelect = document.getElementById("filterSelect");

let stream = null;
let running = false;
let faceVisible = false;
let lastComplimentTime = 0;
let prevScore = 0;

function showCompliment() {
  const compliment = compliments[Math.floor(Math.random() * compliments.length)];
  complimentEl.style.opacity = 0;
  complimentEl.style.transform = "scale(0.96)";
  setTimeout(() => {
    complimentEl.textContent = compliment;
    complimentEl.style.opacity = 1;
    complimentEl.style.transform = "scale(1)";
  }, 150);
}

async function startCamera() {
  try {
    statusEl.textContent = "Requesting camera permission...";
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
    await video.play();
    video.className = filterSelect.value;
    statusEl.textContent = "Camera on. Looking for a face...";
    running = true;
    detectLoop();
  } catch (err) {
    statusEl.textContent = "Camera permission denied or unavailable.";
  }
}

function detectLoop() {
  if (!running) return;

  const ctx = canvas.getContext("2d");

  if (video.readyState >= 2) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let total = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      total += (r + g + b) / 3;
      count++;
    }

    const avg = count ? total / count : 0;
    const motionScore = Math.abs(avg - prevScore);
    prevScore = avg;

    const detected = avg > 35 && avg < 220 && motionScore > 0.5;

    if (detected && !faceVisible) {
      faceVisible = true;
      statusEl.textContent = "Face likely detected!";
      if (Date.now() - lastComplimentTime > 2000) {
        showCompliment();
        lastComplimentTime = Date.now();
      }
    } else if (!detected && faceVisible) {
      faceVisible = false;
      statusEl.textContent = "No face detected.";
    }
  }

  requestAnimationFrame(detectLoop);
}

filterSelect.addEventListener("change", () => {
  video.className = filterSelect.value;
});

startBtn.addEventListener("click", startCamera);