import { app } from 'electron'
import debug from 'electron-debug'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'
import './index'

app.on('ready', () => {
  installExtension(REACT_DEVELOPER_TOOLS).catch(err => {
    console.log('Unable to install `react-devtools`: \n', err)
  })
  debug({ showDevTools: 'undocked' })
})
