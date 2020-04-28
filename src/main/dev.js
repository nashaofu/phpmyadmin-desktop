import { app } from 'electron'
import debug from 'electron-debug'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'

app.whenReady().then(() => {
  installExtension(REACT_DEVELOPER_TOOLS).catch(err => {
    console.log('Unable to install `react-devtools`: \n', err)
  })
  debug({ showDevTools: 'undocked' })
})
