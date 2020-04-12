import path from 'path'
import install from './install'
import fs from 'fs-extra'
import detect from 'detect-port'
import { spawn } from 'child_process'
import { app, BrowserWindow } from 'electron'

const userData = app.getPath('userData')
const phpDir = path.join(userData, './archives/php')
const phpMyAdminDir = path.join(userData, './archives/phpMyAdmin')

export default class App {
  port=null
  phpProcess = null
  constructor () {
    this.init()
  }

  async init () {
    app.on('window-all-closed', () => {
      app.quit()
      if (this.phpProcess) {
        this.phpProcess.kill()
      }
    })
    const pathExists = await Promise.all([fs.pathExists(phpDir), fs.pathExists(phpMyAdminDir)])

    // 有一个不存在就表示是第一次安装
    if (pathExists.some(pathExist => !pathExist)) {
      return install()
    }
    await app.whenReady()
    let win = new BrowserWindow({
      width: 1000,
      height: 800,
      show: false,
      type: 'desktop',
      center: true,
      resizable: false,
      fullscreenable: false,
      autoHideMenuBar: true,
      darkTheme: true
    })
    win.on('closed', () => {
      win = null
    })

    win.on('ready-to-show', () => {
      win.show()
    })

    this.port = await detect()
    this.phpProcess = spawn(
      path.join(phpDir, './php.exe'),
      ['-S', `127.0.0.1:${this.port}`, '-t', phpMyAdminDir, '-c', path.join(phpDir, './php.ini')],
      {
        cwd: phpDir,
        stdio: ['inherit', 'inherit', 'inherit']
      }
    )

    // 加载远程URL
    const url = `http://127.0.0.1:${this.port}`
    console.log('url为：', url)
    win.loadURL(url)
  }
}
