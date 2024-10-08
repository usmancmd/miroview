const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
	// Window top bar button channels
	minimizeWindow: () => ipcRenderer.invoke("minimize-window"),
	quitWindow: () => ipcRenderer.invoke("quit-window"),

	// App functions channels
	startScrcpy: (commandOptions) =>
		ipcRenderer.invoke("start-scrcpy", commandOptions),
	stopScrcpy: () => ipcRenderer.invoke("stop-scrcpy"),
	statusUpdate: () => ipcRenderer.invoke("status-update"),
	customEvent: {
		on: (channel, listener) => ipcRenderer.on(channel, listener),
		send: (channel, data) => ipcRenderer.send(channel, data),
	},
});
