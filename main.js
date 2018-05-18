'use strict';

// Import parts of electron to use
const {app, BrowserWindow, Menu, ipcMain, dialog} = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let windows = [];

// Keep a reference for dev mode
let dev = false;
if ( process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath) ) {
    dev = true;
}

function createWindow() {
    // Create the browser window.
    let window = new BrowserWindow({
        width: 1024, height: 768, show: false
    });

    // and load the index.html of the app.
    let indexPath;
    if ( dev && process.argv.indexOf('--noDevServer') === -1 ) {
        indexPath = url.format({
            protocol: 'http:',
            host: 'localhost:8080',
            pathname: 'index.html',
            slashes: true
        });
    } else {
        indexPath = url.format({
            protocol: 'file:',
            pathname: path.join(__dirname, 'dist', 'index.html'),
            slashes: true
        });
    }
    window.loadURL( indexPath );

    // Don't show until we are ready and loaded
    window.once('ready-to-show', () => {
        window.show();
        // Open the DevTools automatically if developing
        if ( dev ) {
            window.webContents.openDevTools();
        }


    });

    let id = windows.length;
    windows.push(window);
    // Emitted when the window is closed.
    window.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        window = null;
        windows[id] = null;
        windows.splice(id, 1);
    });
    return window;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ( event ) => { createWindow(); } );

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (windows === []) {
        createWindow();
    }
});

ipcMain.on('openFromPath', (event, message) => {
    let item = message;
    let window = createWindow();
    window.once('ready-to-show', () => {
        window.webContents.send('loadPathAndSelect', item);
    });

});

const menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New Window',
                accelerator: 'CmdOrCtrl+n',
                click (menuItem, currentWindow) {

                    createWindow();
                }
            },
            {
                label: 'Open Project folder',
                accelerator: 'CmdOrCtrl+o',
                click (menuItem, currentWindow) {
                    let directory = dialog.showOpenDialog(currentWindow, {
                        title: 'Open Project Folder',
                        properties: ['openDirectory']
                    });
                    if ( directory )
                        currentWindow.webContents.send('loadPath', directory[0]);
                }
            },
            {
                label: 'Open selected in new window',
                accelerator: 'CmdOrCtrl+shift+o',
                click (menuItem, currentWindow) {
                    currentWindow.webContents.send('currentPathForOpen', null);
                }
            },
            {
                label: 'Save',
                accelerator: 'CmdOrCtrl+s',
                click (menuItem, currentWindow) {
                    currentWindow.webContents.send('save', 'save');
                }
            },
            {role: 'quit'}
        ]
    },
    {
        label: 'Edit',
        submenu: [
            {role: 'undo'},
            {role: 'redo'},
            {type: 'separator'},
            {role: 'cut'},
            {role: 'copy'},
            {role: 'paste'},
            {role: 'pasteandmatchstyle'},
            {role: 'delete'},
            {role: 'selectall'}
        ]
    },
    {
        label: 'View',
        submenu: [
            {role: 'reload'},
            {role: 'forcereload'},
            {role: 'toggledevtools'},
            {type: 'separator'},
            {role: 'resetzoom'},
            {role: 'zoomin'},
            {role: 'zoomout'},
            {type: 'separator'},
            {role: 'togglefullscreen'}
        ]
    },
    {
        role: 'window',
        submenu: [
            {role: 'minimize'},
            {role: 'close'}
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'About',
                click () { require('electron').shell.openExternal('https://github.com/davidarias/juno'); }
            }
        ]
    }
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);
