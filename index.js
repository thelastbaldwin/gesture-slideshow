const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const fs = require('fs');
const path = require('path');
const url = require('url');
const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;

let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

ipc.on('open-file-dialog', function(event) {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }, function (directory) {
    if(directory){
      fs.readdir(directory[0], (err, files) => {
        if (files){
          event.sender.send('selected-directory', {directory: directory[0], files});     
        }
      });
    }
  })
});

ipc.on('set-timer', function(event, duration){
  switch(duration){
    case "30s":
      event.sender.send('set-image-interval', 30 * 1000);
      break;
    case "1m":
      event.sender.send('set-image-interval', 60 * 1000);
      break;
    case "2m":
      event.sender.send('set-image-interval', 60 * 2 * 1000);
      break;
    case "5m":
      event.sender.send('set-image-interval', 60 * 5 * 1000);
      break;
    case custom:
      //open dialog
  }
});
