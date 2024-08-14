const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

const os = require("os");
// const path = require('path');
const { exec, execSync, spawn } = require("child_process");

const scrcpyPath = path.join(
	__dirname,
	"resources",
	"scrcpy-win64-v2.6.1",
	"scrcpy.exe"
);
console.log(scrcpyPath);
const command = `${scrcpyPath} --window-title "My Phone Screen"`;
console.log(command);

// get device ip address 1 using ifconfig
function getDeviceIpAddress3(callback) {
	exec("adb shell ifconfig wlan0", (error, stdout, stderr) => {
		if (error) {
			console.error(`Error fetching IP address: ${error.message}`);
			return callback(null);
		}
		if (stderr) {
			console.error(`ADB stderr: ${stderr}`);
			return callback(null);
		}

		console.log(`ADB stdout: ${stdout}`);

		// Parsing the IP address from the stdout
		const ipMatch =
			stdout.match(/inet\s+addr:([0-9.]+)/) || stdout.match(/inet\s+([0-9.]+)/);
		const ipAddress = ipMatch ? ipMatch[1] : null;

		if (ipAddress) {
			console.log(`Device IP Address: ${ipAddress}`);
			callback(ipAddress);
		} else {
			console.error("IP address not found in ADB output.");
			callback(null);
		}
	});
}

// get device ip adderess
function getDeviceIpAddress1(callback) {
	// Step 1: List all connected devices
	exec("adb devices", (error, stdout, stderr) => {
		if (error) {
			console.error(`Error listing devices: ${error.message}`);
			return callback(null);
		}
		if (stderr) {
			console.error(`ADB stderr: ${stderr}`);
			return callback(null);
		}

		// Parse the device list
		const devices = stdout
			.split("\n")
			.filter((line) => line.includes("\tdevice"))
			.map((line) => line.split("\t")[0]);

		if (devices.length === 0) {
			console.error("No devices connected.");
			return callback(null);
		}

		// Step 2: If there's only one device, use it directly
		let targetDevice = devices[0];

		if (devices.length > 1) {
			console.log("Multiple devices found:");
			devices.forEach((device, index) => {
				console.log(`${index + 1}: ${device}`);
			});

			// For simplicity, we'll select the first non-emulator device (modify this as needed)
			targetDevice =
				devices.find((device) => !device.startsWith("emulator")) || devices[0];
			console.log(`Selected device: ${targetDevice}`);
		} else {
			console.log(`Only one device found, selecting: ${targetDevice}`);
		}

		// Step 3: Fetch the IP address from the selected device
		exec(`adb -s ${targetDevice} shell ip route`, (error, stdout, stderr) => {
			if (error) {
				console.error(`Error fetching IP address: ${error.message}`);
				return callback(null);
			}
			if (stderr) {
				console.error(`ADB stderr: ${stderr}`);
				return callback(null);
			}

			console.log(`ADB stdout: ${stdout}`);

			// Parse the IP address from the output
			const ipMatch = stdout.match(/src\s([0-9.]+)/);
			const ipAddress = ipMatch ? ipMatch[1] : null;

			if (ipAddress) {
				console.log(`Device IP Address: ${ipAddress}`);
				callback(ipAddress);
			} else {
				console.error("IP address not found in ADB output.");
				callback(null);
			}
		});
	});
}

function getDeviceIpAddress2(callback) {
	// Step 1: List all connected devices
	exec("adb devices", (error, stdout, stderr) => {
		if (error) {
			console.error(`Error listing devices: ${error.message}`);
			return callback(null);
		}
		if (stderr) {
			console.error(`ADB stderr: ${stderr}`);
			return callback(null);
		}

		// Parse the device list
		const devices = stdout
			.split("\n")
			.filter((line) => line.includes("\tdevice"))
			.map((line) => line.split("\t")[0]);

		if (devices.length === 0) {
			console.error("No devices connected.");
			return callback(null);
		}

		// Step 2: If there's only one device, use it directly
		let targetDevice = devices[0];

		if (devices.length > 1) {
			console.log("Multiple devices found:");
			devices.forEach((device, index) => {
				console.log(`${index + 1}: ${device}`);
			});

			// For simplicity, we'll select the first non-emulator device (modify this as needed)
			targetDevice =
				devices.find((device) => !device.startsWith("emulator")) || devices[0];
			console.log(`Selected device: ${targetDevice}`);
		} else {
			console.log(`Only one device found, selecting: ${targetDevice}`);
		}

		// Step 3: Fetch the IP address from the selected device
		exec(
			`adb -s ${targetDevice} shell ifconfig wlan0`,
			(error, stdout, stderr) => {
				if (error) {
					console.error(`Error fetching IP address: ${error.message}`);
					return callback(null);
				}
				if (stderr) {
					console.error(`ADB stderr: ${stderr}`);
					return callback(null);
				}

				console.log(`ADB stdout: ${stdout}`);

				// Parsing the IP address from the stdout
				const ipMatch =
					stdout.match(/inet\s+addr:([0-9.]+)/) ||
					stdout.match(/inet\s+([0-9.]+)/);
				const ipAddress = ipMatch ? ipMatch[1] : null;

				if (ipAddress) {
					console.log(`Device IP Address: ${ipAddress}`);
					callback(ipAddress);
				} else {
					console.error("IP address not found in ADB output.");
					callback(null);
				}
			}
		);
	});
}

let scrcpyProcess;
function startScrcpy() {
	getDeviceIpAddress2((ipAddress) => {
		if (!ipAddress) {
			console.error("Cannot start scrcpy without an IP address.");
			return;
		}

		const command = `${scrcpyPath} --tcpip=${ipAddress}:5555 --window-title "My Phone Screen"`;

		// here we execute the command using spawn
		scrcpyProcess = spawn(command, { shell: true });

		// Listen to stdout and stderr
		scrcpyProcess.stdout.on("data", (data) => {
			console.log(`scrcpy stdout: ${data}`);
		});

		scrcpyProcess.stderr.on("data", (data) => {
			console.error(`scrcpy stderr: ${data}`);
		});

		// Listen to process exit event
		scrcpyProcess.on("close", (code) => {
			console.log(`scrcpy process exited with code ${code}`);
			if (code !== 0) {
				console.error("scrcpy terminated unexpectedly");
			} else {
				console.log("scrcpy terminated normally");
			}
		});

		// Handle process errors
		scrcpyProcess.on("error", (err) => {
			console.error(`Failed to start scrcpy: ${err.message}`);
		});
	});
}

// Function to stop scrcpy
function stopScrcpy() {
	if (scrcpyProcess) {
		scrcpyProcess.kill("SIGKILL"); // Forcefully kill scrcpy
		console.log("scrcpy process forcefully terminated");

		// Check for any orphaned adb processes related to scrcpy
		try {
			// Find any adb processes started by scrcpy
			const result = execSync(`tasklist /FI "IMAGENAME eq adb.exe"`).toString();

			const lines = result.trim().split("\n").slice(3); // Skip the header lines

			lines.forEach((line) => {
				const columns = line.trim().split(/\s+/);
				const pid = columns[1]; // Process ID of the adb.exe process

				if (pid) {
					process.kill(pid, "SIGKILL"); // Kill the specific adb process
					console.log(`adb subprocess with PID ${pid} terminated`);
				}
			});
		} catch (error) {
			console.error(
				"Error checking for orphaned adb processes:",
				error.message
			);
		}
	} else {
		console.log("scrcpy is not running");
	}
}

function testScrcpy() {
	return "testing scrcpy connection for the first time";
}

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

const createWindow = () => {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
	});

	// and load the index.html of the app.
	mainWindow.loadFile(path.join(__dirname, "src", "index.html"));

	// Open the DevTools.
	mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	ipcMain.handle("test-scrcpy", () => testScrcpy());
	ipcMain.handle("start-scrcpy", () => startScrcpy());
	ipcMain.handle("stop-scrcpy", () => stopScrcpy());
	createWindow();

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
