'use strict';

const electron = require('electron');
// Modules to control application life and create native browser window
const { app, BrowserWindow} = require('electron')

// Live reload module which watches `public` folder
// const _ = require('electron-reload')(__dirname + '/public')

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected
let mainWindow

// A function to create the browser window when the app is ready
function createWindow() {

    // Get width and height of primary display
    //const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
    // Create the browser window.
    mainWindow = new BrowserWindow({
      //width: 600,
      //height: 900,
      // center: true,
      // frame: false,
      // resizable: false,
      // alwaysOnTop: true,
      useContentSize: true // when false, width/height will set the size of the whole app, including frames. If true, innerWindow will be set instead, resulting in a bigger app window
    })
    // Load the index.html of the app
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true,
        autoHideMenuBar: true,
    }))
	//mainWindow.setFullScreen(false); 
	mainWindow.setFullScreen(true); 
	//mainWindow.setMenu(null);
    // Open the DevTools on start
    //ainWindow.webContents.openDevTools("undock");

    // Emitted when the window is closed
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})
