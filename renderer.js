let mode = "display"; // Mode can be "display" or "camera"

let commandOptions = "";

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
