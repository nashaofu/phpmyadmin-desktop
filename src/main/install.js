import path from 'path'
import { app, BrowserWindow } from 'electron'

export default async function install () {
  await app.whenReady()
  let win = new BrowserWindow({
    width: 600,
    height: 640,
    type: 'desktop',
    center: true,
    resizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    darkTheme: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.on('closed', () => {
    win = null
  })
  win.on('ready-to-show', () => {
    win.show()
  })

  const url =
    process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8080' : path.join(__dirname, '../renderer/install.html')

  win.loadURL(url)
}
