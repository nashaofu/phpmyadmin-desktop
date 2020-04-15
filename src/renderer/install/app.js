import os from 'os'
import got from 'got'
import path from 'path'
import fs from 'fs-extra'
import crypto from 'crypto'
import { remote, ipcRenderer } from 'electron'
import decompress from 'decompress'
import React, { Component } from 'react'
import { Steps, Divider, Button } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import archives from '@/common/archives'
import './app.less'

const isWin32 = os.platform() === 'win32'

export default class App extends Component {
  state = {
    step: 0,
    PHP: {
      status: 'wait',
      progress: {
        percent: 0,
        transferred: undefined,
        total: undefined
      }
    },
    phpMyAdmin: {
      status: 'wait',
      progress: {
        percent: 0,
        transferred: undefined,
        total: undefined
      }
    },
    logs: []
  }

  logs = []

  icons = {
    wait: undefined,
    process: <LoadingOutlined />,
    finish: undefined,
    error: undefined
  }

  titles = {
    wait: '未开始',
    process: '正在安装...',
    finish: '安装完成',
    error: '安装失败'
  }

  componentDidMount () {
    this.run()
  }

  run () {
    this.downloadPHP()
      .then(() => this.downloadPhpMyAdmin())
      .then(() => {
        this.setState({
          step: 2
        })
      })
      .catch(error => {
        const { PHP } = this.state
        PHP.status = 'error'
        this.log(`安装失败: ${error.toString()}`)
        this.setState({
          PHP
        })
      })
  }

  log (str) {
    this.logs.push(str)
    this.setState({
      logs: [...this.logs]
    })
  }

  async downloadPHP () {
    this.log('安装PHP...')
    this.setState({
      step: 0,
      PHP: {
        status: 'process',
        progress: {
          percent: 0,
          transferred: undefined,
          total: undefined
        }
      }
    })
    if (os.platform() === 'darwin') {
      this.log('使用系统自带PHP，跳过安装')
      return this.setState({
        PHP: {
          status: 'finish',
          progress: {
            percent: 0,
            transferred: undefined,
            total: undefined
          }
        }
      })
    }

    const archive = isWin32 ? archives.phpWindows : archives.phpSource
    const userDataDir = remote.app.getPath('userData')
    const archivesDir = path.join(userDataDir, './archives')
    const archiveName = path.basename(archive.url)
    const archivePath = path.join(archivesDir, archiveName)
    const isPathExists = await fs.pathExists(archivePath)
    let body

    if (isPathExists) {
      const data = await fs.readFile(archivePath)
      const sha256 = crypto.createHash('sha256').update(data).digest('hex')
      if (sha256 === archive.sha256) {
        body = data
      }
    }

    if (!body) {
      this.log(`下载: ${archive.url}`)
      body = await got(archive.url, {
        responseType: 'buffer',
        resolveBodyOnly: true
      }).on('downloadProgress', progress => {
        const { PHP } = this.state
        PHP.status = 'process'
        progress.percent = `${(progress.percent * 100).toFixed(2)}%`
        PHP.progress = progress
        this.setState({
          PHP
        })
        this.log(`total: ${progress.total} transferred: ${progress.transferred} percent: ${progress.percent}`)
      })
      const sha256 = crypto.createHash('sha256').update(body).digest('hex')
      if (sha256 !== archive.sha256) {
        throw new Error('文件sha256不匹配')
      }
      await fs.outputFile(path.join(archivesDir, path.basename(archive.url)), body)
      this.log('下载成功')
    }

    await this.installPHP(archiveName, body)
  }

  async installPHP (archiveName, buffer) {
    const appPath = remote.app.getAppPath()
    const userDataDir = remote.app.getPath('userData')
    const archivesDir = path.join(userDataDir, './archives')

    this.log(`正在解压文件${archiveName}...`)

    await fs.remove(path.join(archivesDir, './php'))

    await decompress(buffer, path.join(archivesDir, './php'), {
      strip: isWin32 ? 0 : 1
    })

    await fs.copyFile(path.join(appPath, './conf/php.ini'), path.join(archivesDir, './php/php.ini'))

    this.log('解压完成')

    const { PHP } = this.state
    PHP.status = 'finish'
    this.log('安装成功')

    this.setState({
      PHP
    })
  }

  async downloadPhpMyAdmin () {
    this.log('安装phpMyAdmin...')
    this.setState({
      step: 1,
      phpMyAdmin: {
        status: 'process',
        progress: {
          percent: 0,
          transferred: undefined,
          total: undefined
        }
      }
    })

    const archive = archives.phpMyAdmin
    const userDataDir = remote.app.getPath('userData')
    const archivesDir = path.join(userDataDir, './archives')
    const archiveName = path.basename(archive.url)
    const archivePath = path.join(archivesDir, archiveName)
    const isPathExists = await fs.pathExists(archivePath)
    let body

    if (isPathExists) {
      const data = await fs.readFile(archivePath)
      const sha256 = crypto.createHash('sha256').update(data).digest('hex')
      if (sha256 === archive.sha256) {
        body = data
      }
    }

    if (!body) {
      this.log(`下载: ${archive.url}`)
      body = await got(archive.url, {
        responseType: 'buffer',
        resolveBodyOnly: true
      }).on('downloadProgress', progress => {
        const { phpMyAdmin } = this.state
        phpMyAdmin.status = 'process'
        progress.percent = `${(progress.percent * 100).toFixed(2)}%`
        phpMyAdmin.progress = progress
        this.setState({
          PHP: phpMyAdmin
        })
        this.log(`total: ${progress.total} transferred: ${progress.transferred} percent: ${progress.percent}`)
      })
      const sha256 = crypto.createHash('sha256').update(body).digest('hex')
      if (sha256 !== archive.sha256) {
        throw new Error('文件sha256不匹配')
      }
      await fs.outputFile(path.join(archivesDir, path.basename(archive.url)), body)
      this.log('下载成功')
    }

    await this.installPhpMyAdmin(archiveName, body)
  }

  async installPhpMyAdmin (archiveName, buffer) {
    const appPath = remote.app.getAppPath()
    const userDataDir = remote.app.getPath('userData')
    const archivesDir = path.join(userDataDir, './archives')

    this.log(`正在解压文件${archiveName}...`)

    await fs.remove(path.join(archivesDir, './phpMyAdmin'))

    await decompress(buffer, path.join(archivesDir, './phpMyAdmin'), {
      strip: 1
    })

    await fs.copyFile(
      path.join(appPath, './conf/config.default.php'),
      path.join(archivesDir, './phpMyAdmin/libraries/config.default.php')
    )

    this.log('解压完成')

    const { phpMyAdmin } = this.state
    phpMyAdmin.status = 'finish'
    this.log('安装成功')

    this.setState({
      PHP: phpMyAdmin
    })
  }

  complete = () => {
    ipcRenderer.send('app-install-complete')
  }

  render () {
    const { step, PHP, phpMyAdmin, logs } = this.state

    return (
      <div className="app">
        <Steps current={step}>
          <Steps.Step title="安装PHP" icon={this.icons[PHP.status]} status={PHP.status} />
          <Steps.Step title="安装phpMyAdmin" icon={this.icons[phpMyAdmin.status]} status={phpMyAdmin.status} />
          <Steps.Step title="完成" />
        </Steps>
        <div>
          <Divider>
            {step === 0 && this.titles[PHP.status]}
            {step === 1 && this.titles[phpMyAdmin.status]}
          </Divider>
          <pre className="app-log">
            <code>{logs.join('\n')}</code>
          </pre>
          <div className="app-footer">
            <Button type="primary" loading={step !== 2} onClick={this.complete}>
              {step !== 2 ? '安装中...' : '安装完成'}
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
