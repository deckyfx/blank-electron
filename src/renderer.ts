/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

console.log('👋 This message is being logged by "renderer.js", included via webpack');

const btnModifyTitle = document.getElementById('btn-modify-title')
const btnPing = document.getElementById('btn-ping')

btnModifyTitle?.addEventListener('click', () => {
  console.log("[*] button modify title clicked.");
  const newTitle = "Hello Electron with Typescript!";
  window.electronAPI?.modifyTitle(newTitle);
});

btnPing?.addEventListener('click', async () => {
  console.log("[*] button ping clicked.");
  // console.log(window);
  // console.log(window.electronAPI);
  const result = await window.electronAPI?.ping("ping");
  console.log(`[*] ipcMain -> renderer, renderer receive result from ipcMain : ${result}`);
});