const closeBtn = document.getElementById("close");
const minimizeBtn = document.getElementById("minimize");

const closeApp = async () => {
	return await window.electronAPI.quitWindow();
};

closeBtn.addEventListener("click", async () => {
	await closeApp();
});

const minimizeApp = async () => {
	return await window.electronAPI.minimizeWindow();
};

minimizeBtn.addEventListener("click", async () => {
	await minimizeApp();
});
