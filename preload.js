const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	testScrcpy: () => ipcRenderer.invoke("test-scrcpy"),
	startScrcpy: () => ipcRenderer.invoke("start-scrcpy"),
	stopScrcpy: () => ipcRenderer.invoke("stop-scrcpy"),
});
