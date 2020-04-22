import os from 'os'
import got from 'got'
import path from 'path'
import fs from 'fs-extra'
import which from 'which'
import kill from 'tree-kill'
import spawn from 'cross-spawn'
import detect from 'detect-port'
import { app, BrowserWindow, ipcMain, dialog } from 'electron'

const userData = app.getPath('userData')
const phpDir = path.join(userData, './archives/php')
const phpMyAdminDir = path.join(userData, './archives/phpMyAdmin')

export default class App {
  port = null
  phpProcess = null
  installWin = null
  mainWin = null
  constructor () {
    this.init().catch(err => {
      dialog
        .showMessageBox({
          title: '错误',
          buttons: ['确定'],
          message: `软件报错：${err}`
        })
        .then(() => app.exit(1))
    })
  }

  async init () {
    app.setAppUserModelId('com.electron.phpmyadmin-desktop')

    app.on('window-all-closed', () => {
      app.quit()
    })

    app.on('quit', () => {
      if (this.phpProcess && !this.phpProcess.killed) {
        kill(this.phpProcess.pid, 'SIGKILL', err => {
          if (err) {
            this.phpProcess.kill()
          }
        })
      }
    })

    ipcMain.on('app-install-complete', () => {
      app.relaunch()
      app.exit()
    })
    // mac使用内置的php
    const pathExists = await Promise.all([
      os.platform() === 'darwin' ? true : fs.pathExists(phpDir),
      fs.pathExists(phpMyAdminDir)
    ])

    // 有一个不存在就表示是第一次安装
    if (pathExists.some(pathExist => !pathExist)) {
      return this.showInstallWin()
    }
    return this.showMainWin()
  }

  async showInstallWin () {
    await app.whenReady()
    this.installWin = new BrowserWindow({
      width: 600,
      height: 640,
      center: true,
      resizable: false,
      fullscreenable: false,
      darkTheme: true,
      show: false,
      webPreferences: {
        nodeIntegration: true
      }
    })
    this.installWin.removeMenu()

    this.installWin.on('closed', () => {
      this.installWin = null
    })

    this.installWin.on('ready-to-show', () => {
      this.installWin.show()
    })

    const url =
      process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8080/install.html'
        : path.join(__dirname, '../renderer/install.html')

    this.installWin.loadURL(url)
  }

  async showMainWin () {
    if (this.mainWin) {
      return this.mainWin.show()
    }
    await app.whenReady()
    this.mainWin = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false,
      center: true,
      fullscreenable: false,
      darkTheme: true
    })

    this.mainWin.on('closed', () => {
      this.mainWin = null
    })

    this.mainWin.on('ready-to-show', () => {
      this.mainWin.show()
    })

    if (typeof this.port !== 'number' || !this.phpProcess) {
      this.port = await this.startPHPProcess()
    }

    this.mainWin.loadURL(`http://127.0.0.1:${this.port}`)
  }

  async startPHPProcess () {
    let phpPath
    if (os.platform() === 'win32') {
      phpPath = path.join(phpDir, 'php.exe')
    } else if (os.platform() === 'linux') {
      phpPath = path.join(phpDir, 'bin/php')
    } else {
      phpPath = await which('php')
    }

    const port = await detect()

    const args = ['-S', `127.0.0.1:${port}`, '-t', phpMyAdminDir]

    if (os.platform() === 'win32') {
      args.push('-c', path.join(phpDir, './php.ini'))
    }

    this.phpProcess = spawn(phpPath, args, {
      stdio: ['inherit', 'inherit', 'inherit']
    })

    this.phpProcess.on('close', code => {
      this.phpProcess = null
    })

    await got.get(`http://127.0.0.1:${port}`, {
      timeout: 3000,
      retry: {
        calculateDelay: ({ attemptCount }) => {
          // 重试12次，每次间隔500ms
          return attemptCount <= 12 ? 500 : 0
        }
      }
    })

    return port
  }
}
