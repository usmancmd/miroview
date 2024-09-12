const startBtn = document.getElementById("start-btn-id");
const startIcon = document.getElementById("start-icon-id");
const startText = document.getElementById("start-btn-text-id");

// Status
const netStatus = document.getElementById("net-status-id");
const controlBtn = document.getElementById("control-btn");

const bottomBtns = document.getElementById("bottom-btns-id");

const btnOnTop = document.getElementById("btn-on-top");
const btnReadOnlyOrFrontCam = document.getElementById(
	"btn-read-only-or-frontCam"
);
const btnNoAudio = document.getElementById("btn-no-audio");
const btnNoDisplay = document.getElementById("btn-no-display");
const btnLandscape = document.getElementById("btn-landscape");

const btnArray = [
	btnOnTop,
	btnReadOnlyOrFrontCam,
	btnNoAudio,
	btnNoDisplay,
	btnLandscape,
];

let mode = "display"; // Mode can be "display" or "camera"

let commandOptions = "";

const mirrorConfigButtons = {
	onTop: {
		name: "OnTop",
		isToggled: false,
		isDisabled: false,
		value: "--always-on-top",
	},
	readOnly: {
		name: "readOnly",
		isToggled: false,
		isDisabled: false,
		value: "--no-control",
	},
	frontCam: {
		name: "frontCam",
		isToggled: false,
		isDisabled: false,
		value: "--camera-id=1",
	},
	noAudio: {
		name: "noAudio",
		isToggled: false,
		isDisabled: false,
		value: "--no-audio",
	},
	noVideo: {
		name: "noVideo",
		isToggled: false,
		isDisabled: false,
		value: "--no-video",
	},
	landscape: {
		name: "landscape",
		isToggled: false,
		isDisabled: false,
		value: "--display-orientation=flip270",
	},
};

for (const btn of btnArray) {
	modeButtons = mirrorConfigButtons;
	btn.addEventListener("click", () => {
		const buttonText = btn.innerText.trim();
		let config;

		// Map button text to corresponding config
		if (buttonText === "On Top") {
			config = modeButtons.onTop;
		} else if (buttonText === "Read Only" || buttonText === "Front Cam") {
			config = mode === "display" ? modeButtons.readOnly : modeButtons.frontCam;
		} else if (buttonText === "No Audio") {
			config = modeButtons.noAudio;
		} else if (buttonText === "No Video") {
			config = modeButtons.noVideo;
		} else if (buttonText === "Landscape") {
			config = modeButtons.landscape;
		}

		// Handle undefined config
		if (config) {
			const isToggled = (config.isToggled = !config.isToggled); // flip isToggled prop of config b4 assigning it to a variable

			// Update button appearance
			btn.style.background = isToggled ? "#fff" : "rgba(255, 255, 255, 0.165)";
			btn.style.color = isToggled
				? "rgba(25, 136, 248, 0.894)"
				: "rgb(255, 255, 255)";

			// Update commandOptions
			updateCommandOptions(modeButtons);
		} else {
			console.error(`Button configuration not found for: ${buttonText}`);
		}
	});
}

function updateCommandOptions(modeButtons) {
	try {
		commandOptions = Object.values(modeButtons)
			.filter((config) => config.isToggled)
			.map((config) => config.value)
			.join(" ");
	} catch (error) {
		console.error("error updating commandOptions");
	}

	console.log("CommandOptions :", mode, commandOptions); // useful logs for debugging
}

const screenLink = document.getElementById("screen-link");
const cameraLink = document.getElementById("camera-link");

function screenLinkHandler() {
	mode = "display";
	if (cameraLink.classList.contains("tab-b")) {
		screenLink.classList.toggle("tab-b");
		cameraLink.classList.remove("tab-b");
	}

	// Update Read Only button to default state
	document.getElementById("btn-read-only-or-front").innerHTML = `
       <i class="fa-brands fa-creative-commons-zero btn-icon"></i>
       <h5 class="btn-text">Read Only</h5>
    `;

	// Reset all toggles
	for (const key in mirrorConfigButtons) {
		if (mirrorConfigButtons.hasOwnProperty(key)) {
			mirrorConfigButtons[key].isToggled = false;
		}
	}

	// Reset button styles
	for (const btn of btnArray) {
		btn.style.background = "rgba(255, 255, 255, 0.165)";
		btn.style.color = "rgba(255, 255, 255, 1)";
	}

	scommandOptions = "";
	console.log("Mode switched to: ", mode);
	console.log("mirrorScreenButtons", mirrorConfigButtons);
}

function cameraLinkHandler() {
	mode = "camera";
	if (screenLink.classList.contains("tab-b")) {
		cameraLink.classList.toggle("tab-b");
		screenLink.classList.remove("tab-b");
	}

	// Update Front Cam button to default state
	document.getElementById("btn-read-only-or-front").innerHTML = `
        <i class="fa-solid fa-camera-rotate btn-icon"></i>
        <h5 class="btn-text">Front Cam</h5>
    `;

	// Reset all toggles
	for (const key in mirrorConfigButtons) {
		if (mirrorConfigButtons.hasOwnProperty(key)) {
			mirrorConfigButtons[key].isToggled = false;
		}
	}

	// Reset button styles
	for (const btn of btnArray) {
		btn.style.background = "rgba(255, 255, 255, 0.165)";
		btn.style.color = "rgba(255, 255, 255, 1)";
	}

	commandOptions = "";

	console.log("Mode switched to: ", mode);
	console.log("mirrorCameraButtons", mirrorConfigButtons);
}

// Initializing event listeners
screenLink.addEventListener("click", screenLinkHandler);
cameraLink.addEventListener("click", cameraLinkHandler);

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////

const startScrcpyConnection = async () => {
	const res = await window.electronAPI.startScrcpy();
	// console.log("am here...", res);
	return res;
};

const stopScrcpyConnection = async () => {
	const res = await window.electronAPI.stopScrcpy();
	return res;
};

async function startMirroringHandler() {
	const loader = document.createElement("i");
	loader.className = "loader";
	// controlBtn.removeChild(startBtn);
	// // controlBtn.removeChild(startText);
	// controlBtn.appendChild(loader);
	// controlBtn.appendChild(startText);
	// startText.style.opacity = 0;
	updateStartBtn(startBtn, startText, loader, 0);
	console.log("commandOptions:", commandOptions);

	//invoke setStop to get things ready to stop the connection
	// setStop();

	try {
		// statusTemplate.innerText = "Connecting...";
		const response = await startScrcpyConnection();
		const statusRes = JSON.parse(response);

		if (statusRes) {
			// controlBtn.removeChild(loader);
			// // controlBtn.removeChild(startText);
			// controlBtn.appendChild(startBtn);
			// controlBtn.appendChild(startText);
			// startText.style.opacity = 1;
			updateStartBtn(startBtn, startText, loader, 1);

			//invoke setStop to get things ready to stop the connection
			setStop();
		}

		console.log(statusRes);

		// switch (statusRes.statusCode) {
		// 	case 0:
		// 		statusTemplate.innerText = "Connection successful.";
		// 		break;
		// 	case 1:
		// 		statusTemplate.innerText = "Connection failed.";
		// 		break;
		// 	case 2:
		// 		// statusTemplate.innerText = "No device found.";
		// 		showToast(statusRes.message, statusRes.statusCode);
		// 		break;
		// 	case 3:
		// 		statusTemplate.innerText = "USB Connected, Wi-Fi Pending...";
		// 		break;
		// 	case 4:
		// 		statusTemplate.innerText = "Device disconnected.";
		// 		break;
		// 	case 5:
		// 		statusTemplate.innerText = "Connection Interrupt.";
		// 		break;
		// 	case 6:
		// 		statusTemplate.innerText = "Loading...";
		// 		break;
		// 	default:
		// 		statusTemplate.innerText = "Unknown status.";
		// 		break;
		// }

		for (let i = 0; i <= 5; i++) {
			if (i === statusRes.statusCode) {
				if (statusRes) resetStart(i);

				updateStatusIcon(statusRes.message, statusRes.statusCode);
			} else if (statusRes === null) {
				// resetStart();
			}
		}
	} catch (error) {
		console.error("An error occurred:", error);
		// statusTemplate.innerText = "An unexpected error occurred.";
	}
}

async function stopMirroringHandler() {
	// statusTemplate.innerText = "Disconnecting...";
	try {
		const response = await stopScrcpyConnection();
		const statusRes = JSON.parse(response);
		// resetStart(statusRes.statusCode);

		console.log(statusRes); // log this for now!

		switch (statusRes.statusCode) {
			// case 0:
			// 	statusTemplate.innerText = "Connection successful.";
			// 	break;
			// case 1:
			// 	statusTemplate.innerText = "Connection failed.";
			// 	break;
			// case 2:
			// 	statusTemplate.innerText = "No device found.";
			// 	break;
			// case 3:
			// 	statusTemplate.innerText = "Connection interrupted.";
			// 	break;
			case 4:
				// statusTemplate.innerText = "Device disconnected.";
				updateStatusIcon(statusRes.message, statusRes.statusCode);
				break;
				// default:
				// statusTemplate.innerText = "Unknown status.";
				break;
		}
		// statusTemplate.innerText = statusRes;
	} catch (error) {
		// console.log("Stop Screen Mirroring");
	}
}

controlBtn.addEventListener("click", startMirroringHandler);

function setStop() {
	const btnText = document.getElementById("start-btn-text-id");
	const startIcon = document.getElementById("start-icon-id");
	btnText.innerText = btnText.innerText === "Start" ? "Stop" : "Start";
	startIcon.className =
		startIcon.className === "fa-solid fa-play start-icon"
			? "fa-solid fa-stop start-icon"
			: "fa-solid fa-play start-icon";
	controlBtn.removeEventListener("click", startMirroringHandler);
	controlBtn.addEventListener("click", stopMirroringHandler);
}

function resetStart(code) {
	const btnText = document.getElementById("start-btn-text-id");
	const startIcon = document.getElementById("start-icon-id");
	if (code === 2 || code === 3 || code === 4 || code === 5) {
		btnText.innerText = btnText.innerText === "Start" ? "Stop" : "Start";
		startIcon.className =
			startIcon.className === "fa-solid fa-play start-icon"
				? "fa-solid fa-stop start-icon"
				: "fa-solid fa-play start-icon";

		setTimeout(() => {
			netStatus.className = "net-icon-non-active";
			// netStatus.title = "No Active Connections";
		}, 3000);

		controlBtn.addEventListener("click", startMirroringHandler);
	}
}

function updateStatusIcon(msg, code) {
	if (code === 2) {
		netStatus.innerHTML = '<i class="fa-solid fa-plug-circle-xmark"></i>';
		netStatus.className = "net-icon-active-red";
		netStatus.title = msg;
	} else if (code === 0) {
		netStatus.innerHTML = '<i class="fa-solid fa-wifi"></i>';
		netStatus.className = "net-icon-active-blue";
		netStatus.title = msg;
	} else if (code === 3) {
		// resetStart(code);
		netStatus.innerHTML = '<i class="fa-solid fa-plug-circle-check"></i>';
		netStatus.className = "net-icon-active-blue";
		netStatus.title = msg;
	} else if (code === 4) {
		netStatus.className = "net-icon-non-active";
		netStatus.title = msg;
	} else if (code === 5) {
		netStatus.innerHTML = '<i class="fa-solid fa-road-circle-xmark"></i>';
		netStatus.className = "net-icon-active-red";
		netStatus.title = msg;
	}
}

window.electronAPI.customEvent.on("status-update", (event, data) => {
	const status = JSON.parse(data);
	console.log("Received status update:", status);
	// if (status) {
	// 	statusTemplate.innerText = status.message;
	// }

	// if (status.statusCode === 10) {
	// 	netStatus.innerHTML = '<i class="fa-solid fa-plug-circle-check"></i>';
	// }

	if (status.statusCode === 4) {
		resetStart(status.statusCode);
		updateStatusIcon(status.message, status.statusCode);
		// netStatus.className = "net-icon-non-active";
		// netStatus.title = status.message;
	} else if (status.statusCode === 5) {
		resetStart(status.statusCode);
		updateStatusIcon(status.message, status.statusCode);
		// netStatus.innerHTML = '<i class="fa-solid fa-road-circle-xmark"></i>';
		// netStatus.className = "net-icon-active-red";
		// netStatus.title = status.message;
		// setTimeout(() => {
		// 	netStatus.className = "net-icon-non-active";
		// 	// netStatus.title = "No Active Connections";
		// }, 6000);
	}
});

// const controlBtn = document.getElementById('controlBtn');
// const startText = document.getElementById('startText');

function updateStartBtn(btn, text, loader, opacity) {
	// Clear the controlBtn contents
	controlBtn.innerHTML = "";

	if (opacity === 0) {
		controlBtn.appendChild(loader);
	} else if (opacity === 1) {
		controlBtn.appendChild(btn);
	}

	controlBtn.appendChild(text);
	startText.style.opacity = opacity;
}
