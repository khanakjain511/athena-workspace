import { app, BrowserWindow, ipcMain, dialog, session } from 'electron'
import { Buffer } from 'node:buffer'
import { createRequire } from 'node:module'
import path from 'node:path'
import fs from 'node:fs'

app.setName('Athena')
if (process.env.ATHENA_USER_DATA_DIR) app.setPath('userData', path.resolve(process.env.ATHENA_USER_DATA_DIR))

let electronWindow = null
let assessmentServer = null
let applicationUrl = 'http://localhost:5173'
let timerInterval = null
let snapshotInterval = null
let cameraShotPath = null

function stopTimer() {
  clearInterval(timerInterval)
  clearInterval(snapshotInterval)
  timerInterval = null
  snapshotInterval = null
}

async function startAssessmentServer() {
  const require = createRequire(import.meta.url)
  const { createExamApp } = require(path.join(process.resourcesPath, 'backend', 'server.js'))
  const api = createExamApp({
    dataDirectory: path.join(app.getPath('userData'), 'assessments'),
    staticDirectory: path.join(app.getAppPath(), 'dist'),
  })
  await new Promise((resolve, reject) => {
    assessmentServer = api.listen(0, '127.0.0.1', resolve)
    assessmentServer.once('error', reject)
  })
  applicationUrl = `http://127.0.0.1:${assessmentServer.address().port}`
}

function trustedSender(event) {
  return event.sender === electronWindow?.webContents && new URL(event.sender.getURL()).origin === new URL(applicationUrl).origin
}

function handle(channel, action) {
  ipcMain.handle(channel, (event, ...args) => {
    if (!trustedSender(event)) throw new Error('This request is unavailable outside the assessment workspace.')
    return action(...args)
  })
}

async function createWindow() {
  electronWindow = new BrowserWindow({
    title: 'Athena',
    height: 900,
    width: 1320,
    minHeight: 620,
    minWidth: 900,
    show: false,
    backgroundColor: '#f7f8fa',
    webPreferences: {
      devTools: !app.isPackaged,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(import.meta.dirname, 'preload.cjs'),
      additionalArguments: app.isPackaged ? ['--athena-packaged'] : [],
    },
  })
  electronWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  electronWindow.webContents.on('will-navigate', (event, url) => {
    if (new URL(url).origin !== new URL(applicationUrl).origin) event.preventDefault()
  })
  electronWindow.once('ready-to-show', () => electronWindow?.show())
  electronWindow.on('closed', () => { stopTimer(); electronWindow = null })
  await electronWindow.loadURL(applicationUrl)
}

handle('start-timer', () => {
  stopTimer()
  const startedAt = Date.now()
  timerInterval = setInterval(() => electronWindow?.webContents.send('timer', Math.floor((Date.now() - startedAt) / 1000)), 1000)
  snapshotInterval = setInterval(() => electronWindow?.webContents.send('camera-shot'), 5000)
})
handle('stop-timer', stopTimer)
handle('store-camera-snap-image-on-disk', (data) => {
  if (!(data instanceof ArrayBuffer) || data.byteLength > 10 * 1024 * 1024) throw new Error('The camera snapshot could not be saved.')
  const directory = cameraShotPath || path.join(app.getPath('userData'), 'camera-snapshots')
  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(path.join(directory, `${Date.now()}.jpg`), Buffer.from(data))
})
handle('showMessageBox', () => dialog.showMessageBox(electronWindow, {
  type: 'info',
  title: 'Assessment guidelines',
  message: 'Camera snapshots are saved on this device during your assessment.',
  buttons: ['OK'],
}))
handle('selectFile', () => dialog.showOpenDialog(electronWindow, { properties: ['openFile'] }))
handle('selectFolder', async () => {
  const selection = await dialog.showOpenDialog(electronWindow, { title: 'Choose snapshot folder', properties: ['openDirectory'] })
  if (!selection.canceled && selection.filePaths[0]) cameraShotPath = selection.filePaths[0]
  return cameraShotPath
})
handle('showSaveDialogBox', () => dialog.showSaveDialog(electronWindow, { title: 'Save assessment file' }))
ipcMain.on('show-rules', (event) => {
  if (!trustedSender(event)) return
  dialog.showMessageBox(electronWindow, {
    type: 'info',
    title: 'Assessment guidelines',
    message: 'Work independently, keep your camera connected, and remain in full screen until you submit.',
  })
})

app.whenReady().then(async () => {
  if (app.isPackaged) await startAssessmentServer()
  session.defaultSession.setPermissionCheckHandler((webContents, permission, origin) => permission === 'media' && webContents === electronWindow?.webContents && origin === new URL(applicationUrl).origin)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
    callback(permission === 'media' && webContents === electronWindow?.webContents && new URL(webContents.getURL()).origin === new URL(applicationUrl).origin && details.mediaTypes?.every((type) => type === 'video'))
  })
  await createWindow()
  app.on('activate', () => {
    if (!electronWindow) createWindow().catch(() => { dialog.showErrorBox('Athena could not open', 'Close Athena and try again.'); app.quit() })
  })
}).catch(() => {
  dialog.showErrorBox('Athena could not start', 'The assessment workspace could not open. Close the application and try again.')
  app.quit()
})
app.on('window-all-closed', () => app.quit())
app.on('before-quit', () => { stopTimer(); assessmentServer?.close() })
