const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('athena', {
  isPackaged: process.argv.includes('--athena-packaged'),
  registerListenerForTimerTickFromMain: (callback) => {
    const listener = (_event, message) => callback(message)
    ipcRenderer.on('timer', listener)
    return () => ipcRenderer.removeListener('timer', listener)
  },
  registerListenerForCameraSnapFromMain: (callback) => {
    const listener = () => callback()
    ipcRenderer.on('camera-shot', listener)
    return () => ipcRenderer.removeListener('camera-shot', listener)
  },
  startTimerOnMain: () => ipcRenderer.invoke('start-timer'),
  stopTimerOnMain: () => ipcRenderer.invoke('stop-timer'),
  storeCameraSnapImageOnDisk: (data) => ipcRenderer.invoke('store-camera-snap-image-on-disk', data),
  showRules: () => ipcRenderer.send('show-rules'),
  showMessageBox: () => ipcRenderer.invoke('showMessageBox'),
  selectFile: () => ipcRenderer.invoke('selectFile'),
  selectFolder: () => ipcRenderer.invoke('selectFolder'),
  showSaveDialogBox: () => ipcRenderer.invoke('showSaveDialogBox'),
})
