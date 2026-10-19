// Gives the game page a tiny, safe bridge to the desktop updater (no Node access for the page).
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("sqDesktop", {
  info: () => ipcRenderer.invoke("sq:info"),
  check: () => ipcRenderer.invoke("sq:check"),
  update: () => ipcRenderer.invoke("sq:update")
});
