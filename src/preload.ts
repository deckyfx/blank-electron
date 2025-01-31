// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron/renderer";
import { RxTodo } from "./types/models";

type ElectronAPI = {
  modifyTitle: (newTitle: string) => void;
  ping: (data: string) => Promise<string>;
  writeRxDB: () => void;
  readRxDB: () => Promise<any>;

  rxdb: {
    addTodo: (todo: string) => Promise<void>;
    loadTodos: () => Promise<string>;

    addDemo: (demo: string) => Promise<void>;
    loadDemos: () => Promise<string>;

    listenTodo: () => Promise<void>;
    stopListenTodo: () => Promise<void>;
    onTodoChanged: (channel: string, callback: (data: string) => void) => void;

    toggleDone: (todo: RxTodo) => Promise<void>;
    deleteTodo: (todo: RxTodo) => Promise<void>;
  };
};

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

contextBridge.exposeInMainWorld("electronAPI", {
  modifyTitle: (newTitle: string) => {
    ipcRenderer.send("setTitle", newTitle);
  },
  ping: async (data: string) => {
    console.log(
      `[*] renderer -> preload, preload receive data from renderer: ${data}`
    );
    const result = await ipcRenderer.invoke("ping", data);
    return result;
  },
  writeRxDB: () => {
    ipcRenderer.send("writeRxDB");
  },
  readRxDB: async () => {
    return await ipcRenderer.invoke("readRxDB");
  },

  rxdb: {
    addTodo: async (todo: string) => {
      ipcRenderer.send("addTodo", todo);
      return;
    },

    loadTodos: async () => {
      const result: string = await ipcRenderer.invoke("loadTodos");
      return result;
    },

    addDemo: async (demo: string) => {
      ipcRenderer.send("addDemo", demo);
      return;
    },

    loadDemos: async () => {
      const result: string = await ipcRenderer.invoke("loadDemos");
      return result;
    },

    listenTodo: async () => {
      ipcRenderer.send("listenTodo");
      return;
    },

    stopListenTodo: async () => {
      ipcRenderer.send("stopListenTodo");
      return;
    },

    onTodoChanged: (channel: string, callback: (data: string) => void) => {
      ipcRenderer.on(channel, (event, data) => {
        callback(data);
      });
    },

    toggleDone: async (todo: RxTodo) => {
      ipcRenderer.send("toggleDone", todo);
      return;
    },

    deleteTodo: async (todo: RxTodo) => {
      ipcRenderer.send("deleteTodo", todo);
      return;
    },
  },
} as ElectronAPI);
