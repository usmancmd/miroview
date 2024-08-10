const testBtn = document.getElementById("test-btn");
const startBtn = document.getElementById("start-btn");
const stopBtn = document.getElementById("stop-btn");

const func = async () => {
	const test = await window.electronAPI.testScrcpy();

	testBtn.addEventListener("click", () => {
		console.log(test);
	});
};

func();

const startScrcpyConnection = async () => {
	await window.electronAPI.startScrcpy();
};

const stopScrcpyConnection = async () => {
	await window.electronAPI.stopScrcpy();
};

startBtn.addEventListener("click", () => {
	startScrcpyConnection();
	console.log("Start Screen Mirroring");
});

stopBtn.addEventListener("click", () => {
	stopScrcpyConnection();
	console.log("Stop Screen Mirroring");
});
