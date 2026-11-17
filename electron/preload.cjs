const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("goitWindow", {
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
  applyCursor: (cursor) => ipcRenderer.invoke("cursor:apply", cursor),
  getCursorPreview: (relativePath) => ipcRenderer.invoke("cursor:preview", relativePath),
});
