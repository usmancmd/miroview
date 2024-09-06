const bottomBtns = document.getElementById("bottom-btns-id");

const btnOnTop = document.getElementById("btn-on-top");
const btnReadOnlyOrFront = document.getElementById("btn-read-only-or-front");
const btnNoAudio = document.getElementById("btn-no-audio");
const btnNoDisplay = document.getElementById("btn-no-display");
const btnLandscape = document.getElementById("btn-landscape");

const btnArray = [
	btnOnTop,
	btnReadOnlyOrFront,
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
			const isToggled = (config.isToggled = !config.isToggled);

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
	// if (modeCommandOptions === "") {
	try {
		commandOptions = Object.values(modeButtons)
			.filter((config) => config.isToggled)
			.map((config) => config.value)
			.join(" ");
	} catch (error) {
		console.error("error updating commandOptions");
	}

	console.log("CommandOptions :", mode, commandOptions);
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

	// Reset all toggles for screen
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
