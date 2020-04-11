const path = require('path')
const fs = require('fs-extra')
const detect = require('detect-port')
const { spawn } = require('child_process')

const { app, BrowserWindow } = require('electron')

app.on('window-all-closed', () => {
  app.quit()
})

app.whenReady().then(() => {
  let win = new BrowserWindow({ width: 1000, height: 800, show: false })
  win.on('closed', () => {
    win = null
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  detect()
    .then(port => {
      const appDir = app.getAppPath()
      const userData = app.getPath('userData')
      const asarUnpackDir = process.env.DEBUG ? __dirname : path.join(path.dirname(appDir), './app.asar.unpacked')
      const phpDir = path.join(asarUnpackDir, './php')
      const phpMyAdminDir = path.join(asarUnpackDir, './phpMyAdmin')

      const child = spawn(
        path.join(phpDir, './php.exe'),
        ['-S', `127.0.0.1:${port}`, '-t', phpMyAdminDir, '-c', path.join(phpDir, './php.ini')],
        {
          cwd: phpDir,
          stdio: ['inherit', 'inherit', 'inherit'],
          env: {
            USER_DATA_DIR: userData
          }
        }
      )

      // 加载远程URL
      const url = `http://127.0.0.1:${port}`
      console.log('url为：', url)
      win.loadURL(url)
    })
    .catch(err => {
      console.error(err)
    })
})
