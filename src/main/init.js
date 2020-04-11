import path from 'path'
import { app, BrowserWindow } from 'electron'

export default async function init () {
  await app.whenReady()
  let win = new BrowserWindow({
    width: 500,
    height: 400,
    show: false
  })

  win.on('closed', () => {
    win = null
  })

  const url =
    process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8080' : path.join(__dirname, '../renderer/index.html')

  win.loadFile(url)
}
