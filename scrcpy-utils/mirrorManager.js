const { exec, execSync, spawn } = require("child_process");
const path = require("node:path");
const { getDeviceIpAddress2 } = require("./ipAddressManager");

let scrcpyProcess;
let isScrcpyProcessExist = false;
let isDisconnected = false;

async function stopMirroringProcess() {
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
}

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
		});

		scrcpyProcess.on("error", (err) => {
			reject(err);
		});
	});
}

async function stopMirroringProcess() {
	if (isScrcpyProcessExist === true) {
		if (scrcpyProcess) {
			console.log("line 265", scrcpyProcess.toString());
			// scrcpyProcess.kill("SIGTERM"); // Graceful termination

			console.log("scrcpy process termination signal sent");

			// Handle process errors
			scrcpyProcess.on("error", (err) => {
				console.error(`Failed to start scrcpy: ${err.message}`);
			});

			// Check for orphaned adb processes
			const isDisconnected = await stopScrcpyProcess();
			// if (isDisconnected) return isDisconnected;
			if (isDisconnected) {
				return { statusCode: 4, message: "Device Disconnected" };
			}
		} else {
			console.log("scrcpy is not running");
		}
	}
}

async function stopScrcpyProcess() {
	return new Promise((resolve, reject) => {
		// let isDisconnected = false;
		try {
			const adbTaskList = execSync(
				`tasklist /FI "IMAGENAME eq adb.exe"`
			).toString();
			const scrcpyTaskList = execSync(
				`tasklist /FI "IMAGENAME eq scrcpy.exe"`
			).toString();
			// console.log("adbTaskList: ", adbTaskList);
			// console.log("scrcpyTaskList: ", scrcpyTaskList);

			const adbTaskLines = adbTaskList.trim().split("\n").slice(3); // Skip the header lines
			const scrcpyTaskLines = scrcpyTaskList.trim().split("\n").slice(2); // Skip the header lines
			// console.log("adbTaskLines: ", adbTaskLines);
			// console.log("scrcpyTaskLines: ", scrcpyTaskLines);

			scrcpyTaskLines.forEach((line) => {
				const columns = line.trim().split(/\s+/);
				// console.log("columns: ", columns);

				const pid = columns[1]; // Process ID of the adb.exe process

				if (pid) {
					try {
						const result = execSync(`taskkill /PID ${pid} /F`); // Kill the specific adb process
						if (result) {
							isScrcpyProcessExist = false;
						}
					} catch (error) {
						console.log("An error occured while stoping scrcpy Process", error);
					}

					console.log(`scrcpy process with PID ${pid} terminated`);
				}
			});

			// setTimeout(() => {
			adbTaskLines.forEach((line) => {
				const columns = line.trim().split(/\s+/);
				// console.log("columns: ", columns);

				const pid = columns[1]; // Process ID of the adb.exe process

				if (pid) {
					const result = execSync(`taskkill /PID ${pid} /F`); // Kill the specific adb process
					if (result) {
						isDisconnected = true;
						resolve(isDisconnected);
					}
					console.log(`adb subprocess with PID ${pid} terminated`);
				}
			});
			// }, 500);

			return;
		} catch (error) {
			reject(isDisconnected);
			console.error(
				"Error checking for orphaned adb processes:",
				error.message
			);
		}
	});
}

module.exports = {
	stopMirroringProcess,
	stopMirroringProcess,
};
