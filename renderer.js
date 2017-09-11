const ipc = require('electron').ipcRenderer
const debounce = require("lodash.debounce");

const selectDirBtn = document.getElementById('select-directory')
const imageEl = document.getElementById("current-image");
const mainEl = document.getElementsByTagName("main")[0];
const controlsEl = document.getElementById("controls");
const settingsIconEl = document.getElementById("settings-icon");
const forwardIconEl = document.getElementById("forward-icon");
const backIconEl = document.getElementById("back-icon");
const settingsEl = document.getElementById("settings");
const timeEl = document.getElementById("time");
const timerButtons = document.getElementsByClassName("timer-button");

let currentDir;
let files = [];
let fileIndex = 0;
let imageInterval;
let timerLength;
let currentTimerValue;

selectDirBtn.addEventListener('click', function(event) {
  event.preventDefault();
  ipc.send('open-file-dialog');
});

ipc.on('selected-directory', function(event, arg) {
  currentDir = arg.directory;
  files = arg.files;
  fileIndex = 0;
  getNextFile();
});

ipc.on('set-image-interval', function(event, arg){
  setupTimer(arg);
});

function hideControls(){
  controlsEl.classList.add("hidden");
}

function showControls(){
  controlsEl.classList.remove("hidden");
}

function formatTime(seconds){
  const h = Math.floor(seconds / (60 * 60)).toString();
  const m = Math.floor((seconds / 60) % 60).toString();
  const s = (seconds % 60).toString();

  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}`;
}

function updateTimerDisplay(seconds){
  timeEl.innerText = formatTime(seconds);
}

function setTimer(duration){
  timerLength = currentTimerValue = duration;
  clearInterval(imageInterval);
  imageInterval = setInterval(function(){
    currentTimerValue--;
    if (currentTimerValue === 0){
      getNextFile();
      currentTimerValue = timerLength;
    }
    updateTimerDisplay(currentTimerValue);
  }, 1000);
}

function getPreviousFile(){
  imageEl.src = `${currentDir}/${files[fileIndex]}`;
  fileIndex--;
  fileIndex %= files.length;
}

function getNextFile(){
  imageEl.src = `${currentDir}/${files[fileIndex]}`;
  fileIndex++;
  fileIndex %= files.length;
}

function toggleMenu(){
  settingsEl.classList.toggle("active");
  settingsIconEl.classList.toggle("active");
  mainEl.classList.toggle("inactive");
}

function hideMenu(){
  settingsEl.classList.remove("active");
  settingsIconEl.classList.remove("active");
  mainEl.classList.remove("inactive");
}

settingsIconEl.addEventListener("click", toggleMenu);
mainEl.addEventListener("click", hideMenu);
backIconEl.addEventListener("click", getPreviousFile);
forwardIconEl.addEventListener("click", getNextFile);
document.body.addEventListener("mousemove", (function(){
  let hideControlsTimeout = setTimeout(hideControls, 3000);

  return debounce(function(){
    clearInterval(hideControlsTimeout);
    showControls();
    hideControlsTimeout = setTimeout(hideControls, 3000);
  }, 100);
}()));

for(let i = 0; i < timerButtons.length; i++){
  timerButtons[i].addEventListener("click", function(event){
    switch(this.dataset.duration){
      case "30s":
        setTimer(30);
        break;
      case "1m":
        setTimer(60);
        break;
      case "2m":
        setTimer(60 * 2);
        break;
      case "5m":
        setTimer(60 * 5);
        break;
      case "custom":
        //open dialog
    }
  });
}