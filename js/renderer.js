(function(){
  const selectDirEl = document.getElementById('select-directory');
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
  let images = [];
  let fileIndex = 0;
  let imageInterval;
  let timerLength;
  let currentTimerValue;
  let isPaused = true;

  selectDirEl.addEventListener("change", function(event) {
    event.preventDefault();
    const fileRegex = /\.(png|jpe?g|gif|tiff|bmp)/;
    let selectedFiles = selectDirEl.files;
    
    //selectedFiles is returned as an array
    selectedFiles = Array.prototype.filter.call(selectedFiles, file =>{
      return fileRegex.test(file.name);
    });


    if (selectedFiles.length){
      images = [];
      let processedFiles = 0;

      selectedFiles.forEach(function(file, i){
        const reader = new FileReader();

        reader.addEventListener("load", function(){
          images.push(this.result);
          if(++processedFiles === selectedFiles.length){
              fileIndex = 0;
              getNextFile();
          }
        });
        reader.readAsDataURL(file);
      });
    }

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
    if (images.length){
      --fileIndex;
      if (fileIndex < 0) {
        fileIndex = images.length - 1;
      }
      imageEl.src = images[fileIndex];
    }
  }

  function getNextFile(){
    if (images.length){
      ++fileIndex;
      fileIndex %= images.length;
      imageEl.src = images[fileIndex];
    }
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


  function setCustomTime(){
    const customTimeInputValue = document.getElementById("custom-time").value;
    const customTime = parseTime(customTimeInputValue);
    if (customTime.minutes || customTime.seconds){
      setTimer(customTime.minutes * 60 + customTime.seconds);
      if (images.length){
        isPaused = false;
      }
    }
  }

  settingsIconEl.addEventListener("click", toggleMenu);
  
  mainEl.addEventListener("click", hideMenu);

  backIconEl.addEventListener("click", ()=>{
    if (images.length){
      getPreviousFile();
      setTimer(timerLength);
    }

  });
  forwardIconEl.addEventListener("click", ()=>{
    if (images.length){
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

    return function(){
      clearInterval(hideControlsTimeout);
      showControls();
      hideControlsTimeout = setTimeout(hideControls, 3000);
    };
  }()));

  for(let i = 0; i < timerButtons.length; i++){
    timerButtons[i].addEventListener("click", function(event){
      switch(this.dataset.duration){
          case "30s":
            document.getElementById("custom-time").value = "30s";
            setCustomTime();
            break;
        case "1m":
            document.getElementById("custom-time").value = "1m";
            setCustomTime();
            break;
        case "2m":
            document.getElementById("custom-time").value = "2m";
            setCustomTime();
            break;
          break;
        case "5m":
            document.getElementById("custom-time").value = "5m";
            setCustomTime();
            break;
        case "custom":
          setCustomTime();
        }
      });
  }
}());