const ipc = require('electron').ipcRenderer
const debounce = require("lodash.debounce");

const selectDirBtn = document.getElementById('select-directory')
const imageEl = document.getElementById("current-image");
const mainEl = document.getElementsByTagName("main")[0];
const controlsEl = document.getElementById("controls");
const settingsIconEl = document.getElementById("settings-icon");
const forwardIconEl = document.getElementById("forward-icon");
const playIconEl = document.getElementById("play-icon");
const pauseIconEl = document.getElementById("pause-icon");
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
let isPaused = true;

selectDirBtn.addEventListener("click", function(event) {
  event.preventDefault();
  ipc.send("open-file-dialog");
});

ipc.on("selected-directory", function(event, arg) {
  const fileRegex = /\.(png|jpe?g|gif|tiff|bmp)/;

  currentDir = arg.directory;

  files = arg.files.filter(filename => {
    return fileRegex.test(filename);
  });
  fileIndex = 0;
  getNextFile();
});

ipc.on("set-image-interval", function(event, arg){
  setupTimer(arg);
});

function hideControls(){
  controlsEl.classList.add("hidden");
}

function showControls(){
  controlsEl.classList.remove("hidden");
}

function parseTime(timeString){
  const timeRegex = /(\s+)?((\d+)m)?\s?((\d+)s)?/;
  const match = timeRegex.exec(timeString);
  if (match){
    return {
      minutes: +match[3] | 0,
      seconds: +match[5] | 0
    }
  }
}

function formatTime(seconds){
  const h = Math.floor(seconds / (60 * 60)).toString();
  const m = Math.floor((seconds / 60) % 60).toString();
  const s = (seconds % 60).toString();

  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}`;
}

function updateTimerDisplay(seconds){
  if (timerLength){
    timeEl.innerText = formatTime(seconds);
  }
}

function setTimer(duration){
  clearInterval(imageInterval);
  timerLength = currentTimerValue = duration;
  updateTimerDisplay(currentTimerValue);
  imageInterval = setInterval(function(){
    if(!isPaused){
      currentTimerValue--;
      if (currentTimerValue === 0){
        getNextFile();
        currentTimerValue = timerLength;
      }
      updateTimerDisplay(currentTimerValue);
    }
  }, 1000);
}

function getPreviousFile(){
  --fileIndex;
  if (fileIndex < 0) {
    fileIndex = files.length - 1;
  }
  imageEl.src = `${currentDir}/${files[fileIndex]}`;
}

function getNextFile(){
  ++fileIndex;
  fileIndex %= files.length;
  imageEl.src = `${currentDir}/${files[fileIndex]}`;
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
backIconEl.addEventListener("click", ()=>{
  if (files.length){
    getPreviousFile();
    setTimer(timerLength);
  }

});
forwardIconEl.addEventListener("click", ()=>{
  if (files.length){
    getNextFile();
    setTimer(timerLength);
  }
});

playIconEl.addEventListener("click", ()=>{
  isPaused = false;
});

pauseIconEl.addEventListener("click", ()=>{
  isPaused = true;
});

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
      isPaused = false;
      break;
      case "1m":
      setTimer(60);
      isPaused = false;
      break;
      case "2m":
      setTimer(60 * 2);
      isPaused = false;
      break;
      case "5m":
      setTimer(60 * 5);
      isPaused = false;
      break;
      case "custom":
        //open dialog
      }
    });
}