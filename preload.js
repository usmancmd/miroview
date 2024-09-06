const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	// Window navbar button channels
	minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
	quitWindow: () => ipcRenderer.invoke("quit-window"),

	// App functions channels
	startScrcpy: () => ipcRenderer.invoke("start-scrcpy"),
	stopScrcpy: () => ipcRenderer.invoke("stop-scrcpy"),
	statusUpdate: () => ipcRenderer.invoke("status-update"),
	customEvent: {
		on: (channel, listener) => ipcRenderer.on(channel, listener),
		send: (channel, data) => ipcRenderer.send(channel, data),
	},
});
