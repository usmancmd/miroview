const { exec, execSync, spawn } = require("child_process");
const path = require("node:path");
const { getDeviceIpAddress2 } = require("./ipAddressManager");

let scrcpyProcess;
let isScrcpyProcessExist = false;
let isDisconnected = false;

const startScreenMirror = async () => {
	// console.log("ipAddress", ipAddress);

	try {
		// Step 1: Check if ADB process is running
		let adbRunning = false;
		await new Promise((resolve, reject) => {
			const checkCommand = process.platform === "win32" ? "tasklist" : "ps aux";
			exec(checkCommand, (error, stdout, stderr) => {
				if (error) {
					console.error(`Error checking for ADB process: ${error.message}`);
					return reject(error);
				}
				if (stderr) {
					console.error(`Error: ${stderr}`);
					return reject(stderr);
				}
				adbRunning = stdout.toLowerCase().includes("adb");
				resolve();
			});
		});

		// Step 2: Start ADB process if not running
		if (!adbRunning) {
			console.log("ADB process not found, starting ADB...");
			await new Promise((resolve, reject) => {
				exec("adb start-server", (error, stdout, stderr) => {
					if (error) {
						console.error(`Failed to start ADB: ${error.message}`);
						return reject(error);
					}
					if (stderr) {
						console.error(`ADB stderr: ${stderr}`);
						// return reject(stderr);
						return reject({ statusCode: 6, message: "Loading..." });
					}
					console.log(`ADB started: ${stdout}`);
					resolve();
				});
			});
		} else {
			console.log("ADB process is already running.");
		}

		const ipAddress = await getDeviceIpAddress2();
		if (!ipAddress) {
			return { statusCode: 2, message: "No device found" };
		}

		const command = `${scrcpyPath.replace(
			/scrcpy-utils[\/\\]/,
			""
		)} --tcpip=${ipAddress}:5555 --window-title "My Phone Screen"`;

		console.log("Starting scrcpy with command:", command);

		const isConnected = await executeScrcpyCommand(command);

		if (isConnected) {
			return { statusCode: 0, message: "Connection successful" };
		} else {
			return { statusCode: 1, message: "Connection failed" };
		}
	} catch (error) {
		console.log("119 error", typeof error);

		// return { statusCode: 3, message: "Connection interrupted" };
		return error;
	}
};

async function executeScrcpyCommand(command) {
	return new Promise((resolve, reject) => {
		let isConnected = false;

		scrcpyProcess = spawn(command, { shell: true });
		if (scrcpyProcess) {
			isScrcpyProcessExist = true;
		}

		// Listen to stdout for connection success
		scrcpyProcess.stdout.on("data", (data) => {
			const output = data.toString();
			console.log(`scrcpy stdout: ${output}`);
			if (output.includes("Renderer") || output.includes("Texture")) {
				isConnected = true;
				resolve(true);
			}
			// if (output.includes("0")) {
			// 	scrcpyProcess.stderr.on("data", (data) => {
			// 		// console.error(`from 71 scrcpy stderr: ${data}`);
			// 		const output = data.toString();
			// 		if (output.includes("Killing the server")) {
			// 			isDisconnected = true;
			// 			resolve(isDisconnected);
			// 		}
			// 	});
			// }
		});

		scrcpyProcess.stderr.on("data", (data) => {
			console.error(`from 71 scrcpy stderr: ${data}`);
			const output = data.toString();
			// if (output.includes("Killing the server"))
		});

		scrcpyProcess.on("close", (code) => {
			console.log("from line 88: scrcpy exit code:", typeof code, code);
			if (code === 0) {
				eventEmitter.emit("custom-event", {
					statusCode: 4,
					message: "Device disconnected",
				});
			} else if (code === 2) {
				eventEmitter.emit("custom-event", {
					statusCode: 5,
					message: "Connection Interrupt",
				});
			}
			// } else if (code === 1) {
			// 	eventEmitter.emit("custom-event", {
			// 		statusCode: 7,
			// 		message: "Connection Failled, Check your wi-fi connection...",
			// 	});

			// if (!isConnected) {
			// 	resolve(false);
			// } else if (code === 2) {
			// 	resolve({ statusCode: 4, message: "Device disconnected" });
			// }
		});

		scrcpyProcess.on("error", (err) => {
			reject(err);
		});
	});
}

module.exports = {
	startScreenMirror,
};
