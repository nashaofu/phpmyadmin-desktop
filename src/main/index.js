import path from 'path'
import init from './init'
import fs from 'fs-extra'
import detect from 'detect-port'
import { spawn } from 'child_process'
import { app, BrowserWindow } from 'electron'

const userData = app.getPath('userData')
const phpDir = path.join(userData, './php')
const phpMyAdminDir = path.join(userData, './phpMyAdmin')

class MainApp {
  constructor () {
    this.init()
  }

  async init () {
    app.on('window-all-closed', () => {
      app.quit()
    })
    const exists = await Promise.all([fs.exists(phpDir), fs.exists(phpMyAdminDir)])

    // 有一个不存在就表示是第一次安装
    if (exists.some(exist => !exist)) {
      return init()
    }
    await app.whenReady()
    let win = new BrowserWindow({
      width: 1000,
      height: 800,
      show: false
    })
    win.on('closed', () => {
      win = null
    })

    win.on('ready-to-show', () => {
      win.show()
    })

    const port = await detect()
    const child = spawn(
      path.join(phpDir, './php.exe'),
      ['-S', `127.0.0.1:${port}`, '-t', phpMyAdminDir, '-c', path.join(phpDir, './php.ini')],
      {
        cwd: phpDir,
        stdio: ['inherit', 'inherit', 'inherit']
      }
    )

    // 加载远程URL
    const url = `http://127.0.0.1:${port}`
    console.log('url为：', url)
    win.loadURL(url)
  }
}

// eslint-disable-next-line no-new
new MainApp()
