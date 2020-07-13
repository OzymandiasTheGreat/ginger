import { app, BrowserWindow, session, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";
import * as MPRIS from "mpris-service";


const flags = process.argv.slice(1);
const serve = flags.some((opt) => opt === "--serve");

let MAIN_WINDOW: BrowserWindow = null;

function createWindow(): BrowserWindow {
	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
		details.requestHeaders.Origin = "*";
		callback({ cancel: false, requestHeaders: details.requestHeaders });
	});

	console.log(path.join(__dirname, "assets/icons/linux/ginger.48x48.png"));
	MAIN_WINDOW = new BrowserWindow({
		width: 800,
		height: 600,
		icon: path.join(__dirname, serve ? "desktop" : "", "assets/icons/linux/ginger.64x64.png"),
		webPreferences: {
			nodeIntegration: true,
			allowRunningInsecureContent: serve ? true : false,
		},
	});

	if (serve) {
		MAIN_WINDOW.loadURL("http://localhost:4257");
	} else {
		MAIN_WINDOW.setMenuBarVisibility(false);
		MAIN_WINDOW.removeMenu();
		MAIN_WINDOW.loadURL(url.format({
			pathname: path.join(__dirname, "index.html"),
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


let mpris;
let mprisMetadata;
let mprisState;


function initMPRIS() {
	mpris = MPRIS({
		name: "ginger",
		identity: "ginger Mopidy/MPD client",
		supportedUriSchemes: ["file", "local", "http", "https", "ytm", "yt", "spotify"],
		supportedMimeTypes: ["audio/mpeg", "application/ogg", "audio/mp4"],
		supportedInterfaces: ["player"],
	});

	mpris.on("error", initMPRIS);
	mpris.on("raise", () => {
		if (MAIN_WINDOW) {
			MAIN_WINDOW.focus();
		}
	});
	mpris.on("quit", () => {
		app.quit();
	});
	mpris.on("next", () => {
		if (MAIN_WINDOW) {
			MAIN_WINDOW.webContents.send("mpris:next");
		}
	});
	mpris.on("previous", () => {
		if (MAIN_WINDOW) {
			MAIN_WINDOW.webContents.send("mpris:previous");
		}
	});
	mpris.on("playpause", () => {
		if (MAIN_WINDOW) {
			MAIN_WINDOW.webContents.send("mpris:playpause");
		}
	});
	mpris.on("pause", () => {
		if (MAIN_WINDOW) {
			MAIN_WINDOW.webContents.send("mpris:pause");
		}
	});
	mpris.on("play", () => {
		if (MAIN_WINDOW) {
			MAIN_WINDOW.webContents.send("mpris:play");
		}
	});
	mpris.on("stop", () => {
		if (MAIN_WINDOW) {
			MAIN_WINDOW.webContents.send("mpris:stop");
		}
	});

	mprisMetadata["mpris:trackid"] = mpris.objectPath(mprisMetadata["mpris:trackid"]);
	mpris.metadata = mprisMetadata;
	switch (mprisState) {
		case "play":
			mpris.playbackStatus = MPRIS.PLAYBACK_STATUS_PLAYING;
			break;
		case "pause":
			mpris.playbackStatus = MPRIS.PLAYBACK_STATUS_PAUSED;
			break;
		case "stop":
			mpris.playbackStatus = MPRIS.PLAYBACK_STATUS_STOPPED;
	}
}


ipcMain.on("mpris:init", (event, metadata, state) => {
	mprisMetadata = metadata;
	mprisState = state;
	initMPRIS();
});
ipcMain.on("mpris:metadata", (event, metadata) => {
	mprisMetadata = metadata;
	if (mpris) {
		mprisMetadata["mpris:trackid"] = mpris.objectPath(mprisMetadata["mpris:trackid"]);
		mpris.metadata = mprisMetadata;
	}
});
ipcMain.on("mpris:state", (event, state) => {
	mprisState = state;
	if (mpris) {
		switch (mprisState) {
			case "play":
				mpris.playbackStatus = MPRIS.PLAYBACK_STATUS_PLAYING;
				break;
			case "pause":
				mpris.playbackStatus = MPRIS.PLAYBACK_STATUS_PAUSED;
				break;
			case "stop":
				mpris.playbackStatus = MPRIS.PLAYBACK_STATUS_STOPPED;
		}
	}
});
