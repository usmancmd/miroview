const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("node:path");
const eventEmitter = require("./events"); // Import the shared EventEmitter

const {
	startMirroringProcess,
	stopMirroringProcess,
} = require("./scrcpy-utils/mirrorManager");

async function startScreenMirror() {
	const status = await startMirroringProcess();
	console.log("from line 20", status);
	return status;
}

ipcMain.handle("start-scrcpy", async () => {
	try {
		const result = await startScreenMirror();
		if (result.statusCode === 6) {
			mainWindow.webContents.send("status-update", JSON.stringify(result));
			const result2 = await startScreenMirror();
			return JSON.stringify(result2);
		}
		return JSON.stringify(result);
	} catch (error) {
		return JSON.stringify({ statusCode: 3, message: "Connection interrupted" });
	}
});

async function stopScreenMirror() {
	const status = await stopMirroringProcess();
	return status;
}

ipcMain.handle("stop-scrcpy", async () => {
	try {
		const result = await stopScreenMirror();
		return JSON.stringify(result); // Return the result with status code and message
	} catch (error) {
		console.log("from main line 43 error", error);
	}
	// return isMirroringDisconnected
	// 	? "Mirroring Disconnected"
	// 	: "Failed to Disconnect mirroring";
});

eventEmitter.on("custom-event", (data) => {
	console.log("Received message from manager.js:", data);
	mainWindow.webContents.send("status-update", JSON.stringify(data));
	// we can add more logic here to handle the message
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
	app.quit();
}

// Evironments
const isDev = process.env.NODE_ENV !== "production";

// Platforms
const isMacOS = process.platform === "darwin";
const isWindows = process.platform === "win32";
const isLinux = process.platform === "linux";

let mainWindow;
const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: isDev ? 1400 : 730,
		// width: 730,
		height: 450,
		frame: false,
		resizable: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
	});

	// force window to minimize if user want to maximize by double clicking the top bar
	mainWindow.on("maximize", (e) => {
		mainWindow.unmaximize();
	});

	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, "src", "index.html"));

	// Open the DevTools.
	// mainWindow.webContents.openDevTools();
	mainWindow.webContents.openDevTools({ mode: "right" });
	mainWindow.webContents.on("did-finish-load", () => {
		mainWindow.setTitle("Miroview");
	});
};

// minimize App
ipcMain.handle("minimize-window", () => {
	mainWindow.minimize();
});

// close App
ipcMain.handle("quit-window", () => {
	app.quit();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	try {
		createWindow();
	} catch (error) {
		console.log("error", error);
	}

	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (!isMacOS) {
		app.quit();
	}
});

// module.exports = { getMainWindow: () => mainWindow };
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
