const { exec } = require("child_process");

function getDeviceIpAddress() {
	return new Promise((resolve, reject) => {
		// Step 1: List all connected devices
		exec("adb devices", (error, stdout, stderr) => {
			if (error) {
				console.error(`Error listing devices: ${error.message}`);
				return reject(null);
			}
			if (stderr) {
				console.error(`ADB stderr: ${stderr}`);
				return reject(null);
			}

			// console.log(
			// 	"xxxxxxxxxxxxxxxxxx line 158:",
			// 	stdout.split("\n")[1].includes("offline")
			// );
			// if (stdout.split("\n")[1].includes("\tdevice")) {
			// 	console.log("xxxxxxxxxxxxxxxxxx line 158:", stdout.split("\n")[1]);
			// } else if (stdout.split("\n")[1].includes("\toffline")) {
			// 	console.log("xxxxxxxxxxxxxxxxxx line 162:", "offline");
			// }

			const outputLine = stdout.split("\n")[1];
			let deviceStatus;
			if (outputLine.includes("device")) {
				deviceStatus = "online";
			} else if (outputLine.includes("offline")) {
				deviceStatus = "offline";
			}
			console.log("xxxxxxxxxxxxxxxxxxx from line174:", deviceStatus);

			// Parse the device list
			const devices = stdout
				.split("\n")
				.filter((line) => line.includes("\tdevice"))
				.map((line) => line.split("\t")[0]);
			// const devices = stdout
			// 	.split("\n")
			// 	.filter((line) => /\t(device|offline)$/.test(line))
			// 	.map((line) => line.split("\t")[0]);

			if (devices.length === 0) {
				console.error("No devices connected.");
				// return reject(null);
				return reject({ statusCode: 2, message: "No device connected." });
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
					devices.find((device) => !device.startsWith("emulator")) ||
					devices[0];
				console.log(`Selected device: ${targetDevice}`);
			} else {
				console.log(`Only one device found, selecting: ${targetDevice}`);
			}

			console.log("devices", devices);

			// Step 3: Fetch the IP address from the selected device
			exec(
				`adb -s ${targetDevice} shell ifconfig wlan0`,
				(error, stdout, stderr) => {
					if (error) {
						console.error(`Error fetching IP address: ${error.message}`);
						return reject({
							statusCode: 3,
							message: "USB Connected, Wi-Fi Pending...",
						});
					}
					if (stderr) {
						console.error(`from ... ADB stderr: ${stderr}`);
						return reject(null);
					}

					console.log(`ADB stdout: ${stdout}`);

					// Parsing the IP address from the stdout
					const ipMatch =
						stdout.match(/inet\s+addr:([0-9.]+)/) ||
						stdout.match(/inet\s+([0-9.]+)/);
					const ipAddress = ipMatch ? ipMatch[1] : null;

					if (ipAddress) {
						console.log(`Device IP Address: ${ipAddress}`);
						resolve(ipAddress);
					} else {
						console.error("IP address not found in ADB output.");
						reject(null);
					}
				}
			);
		});
	});
}

module.exports = {
	getDeviceIpAddress,
};
