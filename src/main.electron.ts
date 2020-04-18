import { app, BrowserWindow } from "electron";
import * as path from "path";
import * as url from "url";


const args = process.argv.slice(1);
const serve = args.some((opt) => opt === "--serve");

let MAIN_WINDOW: BrowserWindow = null;

function createWindow(): BrowserWindow {
	MAIN_WINDOW = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			allowRunningInsecureContent: (serve) ? true : false,
		},
	});

	if (serve) {
		MAIN_WINDOW.loadURL("http://localhost:4257");
	} else {
		MAIN_WINDOW.loadURL(url.format({
			pathname: path.join(__dirname, "index.electron.html"),
			protocol: "file:",
			slashes: true,
		}));
	}

	if (serve) {
		MAIN_WINDOW.webContents.openDevTools();
	}

	MAIN_WINDOW.on("closed", () => {
		MAIN_WINDOW = null;
	});

	return MAIN_WINDOW;
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
	app.quit();
});