/*
"""
    vtv-shell.main frontend module
    ~~~~~~~~~~~~~~~~~~~~~~~~
    This module contains Node.js and Electron functions
    v.0.0.2
    :copyright: (c) 2018 ZVO
*/

// only add update server if it's not being run from cli
if (require.main !== module) {
  require('update-electron-app')({
    logger: require('electron-log')
  })
}

const path = require('path')
const { ipcMain, app, BrowserWindow } = require('electron')
const debug = /--debug/.test(process.argv[2])
var exec = require('executive')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
var xhr = new XMLHttpRequest()
var xhr2 = new XMLHttpRequest()
var xhr3 = new XMLHttpRequest()

if (process.mas) app.setName('vtv-shell')
let mainWindow = null

const gotTheLock = app.requestSingleInstanceLock()

function initialize () {
    if (!gotTheLock) {
        app.quit()
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore()
                mainWindow.focus()
            }
        })

        function createWindow() {
            exec('server/main.exe')
            //exec('venv/Scripts/python.exe server/main.py')
            const windowOptions = {
                width: 1480,
                minWidth: 680,
                height: 840,
                webPreferences: {webSecurity: false},
                title: app.getName()
            }

            if (process.platform === 'linux') {
                windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/zvo-logo-vector.png')
            }

            mainWindow = new BrowserWindow(windowOptions)
            mainWindow.setMenu(null)
            mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))

            // Launch fullscreen with DevTools open, usage: npm run debug
            if (debug) {
                mainWindow.webContents.openDevTools()
                mainWindow.maximize()
            }

            mainWindow.on('closed', () => {
                function sendClose() {
                    var method = 'POST'
                    var url = 'http://127.0.0.1:2328'
                    var data = {"method": "close", "user": 2, "params": []}
                    xhr.onreadystatechange = function () {
                        if (this.readyState === this.DONE) {
                            mainWindow = null
                            app.quit()
                        }
                    }
                    xhr.onerror = function (e) {
                        mainWindow = null
                        app.quit()
                    };
                    xhr.open(method, url)
                    xhr.setRequestHeader('Content-Type', 'application/json')
                    xhr.send(data && JSON.stringify(data))
                }

                sendClose()
            })
        }

        ipcMain.on('closeAction', function (event) {
            function sendClose2() {
                var method = 'POST'
                var url = 'http://127.0.0.1:2328'
                var data = {"method": "close", "user": 2, "params": []}
                xhr2.onreadystatechange = function () {
                    if (this.readyState === this.DONE && this.status === 200) {
                        app.quit()
                    }
                }
                xhr2.onerror = function (e) {
                    app.quit()
                };
                xhr2.open(method, url)
                xhr2.setRequestHeader('Content-Type', 'application/json')
                xhr2.send(data && JSON.stringify(data))
            }

            sendClose2()
        })

        app.on('ready', () => {
            createWindow()
        })

        app.on('window-all-closed', () => {
            function sendClose3() {
                var method = 'POST'
                var url = 'http://127.0.0.1:2328'
                var data = {"method": "close", "user": 2, "params": []}
                xhr3.onreadystatechange = function () {
                    if (this.readyState === this.DONE && this.status === 200) {
                        app.quit()
                    }
                }
                xhr3.onerror = function (e) {
                    app.quit()
                }
                xhr3.open(method, url)
                xhr3.setRequestHeader('Content-Type', 'application/json')
                xhr3.send(data && JSON.stringify(data))
            }

            if (process.platform !== 'darwin') {
                sendClose3()
            }
        })

        app.on('activate', () => {
            if (mainWindow === null) {
                createWindow()
            }
        })
    }
}

var countdown = 1000
var method = 'POST'
var url = 'http://127.0.0.1:2328/ping/'
var data = {"method": "ping"}
var jsonrequestInterval = function () {
    var jsonrequestIntervaled = new XMLHttpRequest()
    jsonrequestIntervaled.open(method, url)
    jsonrequestIntervaled.onreadystatechange = function () {
        //console.log("ok")
    }
    jsonrequestIntervaled.onerror = function (e) {
        //console.log(e)
    }
    jsonrequestIntervaled.setRequestHeader('Content-Type', 'application/json')
    jsonrequestIntervaled.send(data && JSON.stringify(data))
}

setInterval(jsonrequestInterval, countdown)

initialize()