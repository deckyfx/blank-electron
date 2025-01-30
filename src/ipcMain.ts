// * This is entry point for script that run on NodeJS layer

import { BrowserWindow, ipcMain } from "electron";

import initRxDB, {write, read, addTodo} from "./rxdb";

initRxDB();

export function ipcMainProcess(win: BrowserWindow) {
  ipcMain.on("setTitle", (event, title) => {
    console.log(`[*] new title: ${title}`);
    // const webContents = event.sender;
    // const win = BrowserWindow.fromWebContents(webContents)
    win?.setTitle(title);
  });

  ipcMain.handle("ping", (event, value) => {
    console.log(
      `[*] preload -> ipcMain, ipcMain receive data from preload: ${value}`
    );
    return `${value} pong`;
  });

  ipcMain.on("writeRxDB", async (event) => {
    write();
  });

  ipcMain.handle("readRxDB", async (event) => {
    const result = await read();
    return JSON.stringify(result);
  });


  ipcMain.on("addTodo", async (_, todo: string) => {
    const result = await addTodo(todo);
    if (result) {
      console.error(result);
    }
    return;
  });

  ipcMain.handle("loadTodos", async (event) => {
    const result = await read();
    return JSON.stringify(result);
  });
}
