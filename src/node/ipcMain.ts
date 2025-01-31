// * This is entry point for script that run on NodeJS layer

import { BrowserWindow, ipcMain } from "electron";

import initRxDB, {
  write,
  read,
  addTodo,
  listenTodo,
  stopListenTodo,
  toggleDone,
  deleteTodo,
} from "./rxdb";

import { openSQLite, writeSQLite, readSQLite } from "./sqlite";

import { RxTodo } from "../types/models";

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

  ipcMain.on("addDemo", async (_, todo: string) => {
    await writeSQLite(todo);
    return;
  });

  ipcMain.handle("loadDemos", async (event) => {
    const result = await readSQLite();
    console.log(result);
    return JSON.stringify(result);
  });

  ipcMain.on("listenTodo", async (event) => {
    await listenTodo(event);
    return;
  });

  ipcMain.on("stopListenTodo", async (_) => {
    await stopListenTodo();
    return;
  });

  ipcMain.on("toggleDone", async (_, todo: RxTodo) => {
    await toggleDone(todo);
    return;
  });

  ipcMain.on("deleteTodo", async (_, todo: RxTodo) => {
    await deleteTodo(todo);
    return;
  });

  ipcMain.on("setupRxDB", async (event, path: string) => {
    initRxDB(event, path);
    return;
  });

  ipcMain.on("openSQLite", async (event, path: string) => {
    openSQLite(path);
    return;
  });
}
