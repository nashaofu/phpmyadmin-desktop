import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import detect from 'detect-port'
import { spawn } from 'child_process'
import { app, BrowserWindow, ipcMain } from 'electron'

const userData = app.getPath('userData')
const phpDir = path.join(userData, './archives/php')
const phpMyAdminDir = path.join(userData, './archives/phpMyAdmin')

export default class App {
  port = null
  phpProcess = null
  installWin = null
  mainWin = null
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
    ipcMain.on('app-install-complete', () => {
      if (this.installWin) {
        this.installWin.close()
      }
      this.showMainWin()
    })
    const pathExists = await Promise.all([fs.pathExists(phpDir), fs.pathExists(phpMyAdminDir)])

    // 有一个不存在就表示是第一次安装
    if (pathExists.some(pathExist => !pathExist)) {
      return this.showInstallWin()
    }
    this.showMainWin()
  }

  async showInstallWin () {
    await app.whenReady()
    this.installWin = new BrowserWindow({
      width: 600,
      height: 640,
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

    this.installWin.on('closed', () => {
      this.installWin = null
    })

    this.installWin.on('ready-to-show', () => {
      this.installWin.show()
    })

    const url =
      process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8080'
        : path.join(__dirname, '../renderer/install.html')

    this.installWin.loadURL(url)
  }

  async showMainWin () {
    if (this.mainWin) {
      return this.mainWin.show()
    }
    await app.whenReady()
    this.mainWin = new BrowserWindow({
      width: 1000,
      height: 800,
      show: false,
      center: true,
      resizable: false,
      fullscreenable: false,
      autoHideMenuBar: true,
      darkTheme: true
    })
    this.mainWin.on('closed', () => {
      this.mainWin = null
    })

    this.mainWin.on('ready-to-show', () => {
      this.mainWin.show()
    })

    this.port = await detect()
    const exeFile = os.platform() === 'win32' ? 'php.exe' : 'php'
    this.phpProcess = spawn(
      path.join(phpDir, exeFile),
      ['-S', `127.0.0.1:${this.port}`, '-t', phpMyAdminDir, '-c', path.join(phpDir, './php.ini')],
      {
        cwd: phpDir,
        stdio: ['inherit', 'inherit', 'inherit']
      }
    )

    // 加载远程URL
    const url = `http://127.0.0.1:${this.port}`
    console.log('url为：', url)
    this.mainWin.loadURL(url)
  }
}
