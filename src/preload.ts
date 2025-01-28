// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron/renderer'

type ElectronAPI = {
  modifyTitle: (newTitle: string) => void;
  ping: (data: string) => Promise<string>;
  writeRxDB: () => void;
  readRxDB: () => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

contextBridge.exposeInMainWorld('electronAPI', {
  modifyTitle: (newTitle: string) => {
    ipcRenderer.send('setTitle', newTitle) 
  },
  ping: async (data: string) => {
    console.log(`[*] renderer -> preload, preload receive data from renderer: ${data}`);
    const result = await ipcRenderer.invoke('ping', data);
    return result;
  },
  writeRxDB: () => {
    ipcRenderer.send('writeRxDB');
  },
  readRxDB: async () => {
    return await ipcRenderer.invoke('readRxDB');
  }
} as ElectronAPI)

