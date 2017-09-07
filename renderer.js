const ipc = require('electron').ipcRenderer

const selectDirBtn = document.getElementById('select-directory')
const imageEl = document.getElementById("current-image");
const mainEl = document.getElementsByTagName("main")[0];
const settingsIconEl = document.getElementById("settings-icon");
const settingsEl = document.getElementById("settings");
const timerButtons = document.getElementsByClassName("timer-button");

let currentDir;
let files = [];
let fileIndex = 0;
let imageInterval;

selectDirBtn.addEventListener('click', function(event) {
  event.preventDefault();
  ipc.send('open-file-dialog')
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

function setupTimer(duration){
  clearInterval(imageInterval);
  imageInterval = setInterval(getNextFile, duration);
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

for(let i = 0; i < timerButtons.length; i++){
  timerButtons[i].addEventListener("click", function(event){
    ipc.send('set-timer', this.dataset.duration);
  });
}
