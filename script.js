
const PLAYLIST = [
  { title: "Moment of Peace",   artist: "MickeysCat", src: "songs/song1.mp3" },
  { title: "Summer Walk",   artist: "Acoustic Group", src: "songs/song2.mp3" },
  { title: "THE WAY HOME", artist: "Good_B_Music", src: "songs/song3.mp3" },
  { title: "Coniferous forest", artist: "orangery", src: "songs/song4.mp3" },
  
];

const $ = id => document.getElementById(id);
const player = $("player"), titleEl = $("title"), artistEl = $("artist");
const progress = $("progress"), volume = $("volume");
const currentEl = $("current"), durationEl = $("duration");
const playBtn = $("playBtn"), statusEl = $("status"), listEl = $("list");

const audio = new Audio();
audio.preload = "metadata";

let index = 0;
let shuffle = false;
let repeatOne = false;

const fmt = s => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

// paint the filled part of a range slider
const paint = el => el.style.setProperty("--fill", `${(el.value - el.min) / (el.max - el.min) * 100}%`);

/* ---------- playlist ---------- */
function renderList() {
  listEl.innerHTML = "";
  PLAYLIST.forEach((song, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <button class="track" data-i="${i}">
        <span class="n">${i + 1}</span>
        <span class="t">${song.title}<span class="a">${song.artist}</span></span>
        <span class="d">–:––</span>
      </button>`;
    listEl.appendChild(li);

    // read each file's length without playing it
    const probe = new Audio();
    probe.preload = "metadata";
    probe.src = song.src;
    probe.addEventListener("loadedmetadata", () => {
      li.querySelector(".d").textContent = fmt(probe.duration);
    });
  });
}

listEl.addEventListener("click", e => {
  const btn = e.target.closest(".track");
  if (!btn) return;
  const i = Number(btn.dataset.i);
  if (i === index && !audio.paused) return;
  loadTrack(i, true);
});

/* ---------- loading and playing ---------- */
function loadTrack(i, autoplay = false) {
  index = (i + PLAYLIST.length) % PLAYLIST.length;
  const song = PLAYLIST[index];

  audio.src = song.src;
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  document.title = `${song.title} · Spin`;
  statusEl.textContent = "";
  progress.value = 0; paint(progress);
  currentEl.textContent = "0:00";
  durationEl.textContent = "0:00";

  listEl.querySelectorAll(".track").forEach((b, n) => b.classList.toggle("active", n === index));
  if (autoplay) play();
}

function play() {
  audio.play().catch(() => { /* blocked or file missing; the error handler shows a message */ });
}

function togglePlay() {
  audio.paused ? play() : audio.pause();
}

function nextIndex() {
  if (shuffle && PLAYLIST.length > 1) {
    let r;
    do { r = Math.floor(Math.random() * PLAYLIST.length); } while (r === index);
    return r;
  }
  return index + 1;
}

function next() { loadTrack(nextIndex(), true); }

function prev() {
  // if the song is a few seconds in, restart it; otherwise go back a song
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  loadTrack(index - 1, true);
}

/* ---------- audio events ---------- */
audio.addEventListener("play",  () => { player.classList.add("playing");    playBtn.setAttribute("aria-label", "Pause"); });
audio.addEventListener("pause", () => { player.classList.remove("playing"); playBtn.setAttribute("aria-label", "Play"); });

audio.addEventListener("loadedmetadata", () => { durationEl.textContent = fmt(audio.duration); });

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  progress.value = (audio.currentTime / audio.duration) * 1000;
  paint(progress);
  currentEl.textContent = fmt(audio.currentTime);
});

// autoplay: when a song finishes, move on to the next one
audio.addEventListener("ended", () => {
  if (repeatOne) { audio.currentTime = 0; play(); }
  else next();
});

audio.addEventListener("error", () => {
  statusEl.textContent = `Couldn't load "${PLAYLIST[index].src}". Check the file name in the songs folder.`;
});

/* ---------- controls ---------- */
playBtn.addEventListener("click", togglePlay);
$("next").addEventListener("click", next);
$("prev").addEventListener("click", prev);

$("shuffle").addEventListener("click", e => {
  shuffle = !shuffle;
  e.currentTarget.setAttribute("aria-pressed", shuffle);
});
$("repeat").addEventListener("click", e => {
  repeatOne = !repeatOne;
  e.currentTarget.setAttribute("aria-pressed", repeatOne);
});

progress.addEventListener("input", () => {
  paint(progress);
  if (audio.duration) audio.currentTime = (progress.value / 1000) * audio.duration;
});

/* ---------- volume ---------- */
let lastVolume = 70;

function setVolume(v) {
  volume.value = v;
  audio.volume = v / 100;
  paint(volume);
  document.querySelector(".volume").classList.toggle("muted", v === 0);
  try { localStorage.setItem("spin-volume", v); } catch (e) {}
}

volume.addEventListener("input", () => setVolume(Number(volume.value)));
$("mute").addEventListener("click", () => {
  if (Number(volume.value) > 0) { lastVolume = Number(volume.value); setVolume(0); }
  else setVolume(lastVolume || 70);
});

/* ---------- keyboard ---------- */
document.addEventListener("keydown", e => {
  if (e.target.matches("input, button")) return;   // let sliders and buttons behave normally
  if (e.code === "Space") { e.preventDefault(); togglePlay(); }
  if (e.code === "ArrowRight") audio.currentTime += 5;
  if (e.code === "ArrowLeft") audio.currentTime -= 5;
  if (e.code === "ArrowUp") { e.preventDefault(); setVolume(Math.min(100, Number(volume.value) + 5)); }
  if (e.code === "ArrowDown") { e.preventDefault(); setVolume(Math.max(0, Number(volume.value) - 5)); }
});

/* ---------- start ---------- */
let saved = 70;
try { saved = Number(localStorage.getItem("spin-volume") ?? 70); } catch (e) {}
setVolume(saved);
renderList();
loadTrack(0);   // browsers block audio until the first click, so the first song doesn't start by itself
