import { Injectable } from "@angular/core";
import { IpcRenderer } from "electron";

import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { ArtService } from "@src/app/shared/services/art.service";


function makeValidPath(path: string): string {
	const uri = new URL(path);
	const segments: string[] = [];
	let id;
	if (["ytm", "yt", "youtube"].includes(uri.protocol)) {
		if (uri.searchParams.has("id")) {
			id = uri.searchParams.get("id");
		}
	}
	if (uri.protocol) {
		segments.push(uri.protocol.slice(0, uri.protocol.length - 1));
	}
	if (uri.pathname) {
		segments.push(uri.pathname);
	}
	if (id) {
		segments.push(id);
	}
	return segments.join("/");
}


@Injectable({
	providedIn: "root",
})
export class PlatformService {
	private ipc: IpcRenderer;

	constructor(
		private mpc: MPClientService,
		private art: ArtService,
	) {
		this.ipc = (<any> window).require("electron").ipcRenderer;
		this.mpc.connected.subscribe((success) => {
			if (success) {
				this.mpc.status.subscribe((status) => {
					this.mpc.currentSong.subscribe(async (song) => {
						// tslint:disable-next-line:newline-per-chained-call
						const albumArt = await this.art.getArt(song.albumArtist || song.artist, song.album, true).toPromise();
						this.ipc.send("mpris:init", {
							"mpris:trackid": makeValidPath(song.path),
							"mpris:length": song.duration * 1000 * 1000,
							"mpris:artUrl": (albumArt && (albumArt[1] || albumArt[0])) || "",
							"xesam:title": song.title || song.name || "",
							"xesam:album": song.album || "",
							"xesam:artist": [song.artist || song.albumArtist || ""],
						}, status.state);
					});
				});
				this.mpc.on("changed-player")
					.subscribe(() => {
						this.mpc.currentSong.subscribe(async (song) => {
							// tslint:disable-next-line:newline-per-chained-call
							const albumArt = await this.art.getArt(song.albumArtist || song.artist, song.album, true).toPromise();
							this.ipc.send("mpris:metadata", {
								"mpris:trackid": makeValidPath(song.path),
								"mpris:length": song.duration * 1000 * 1000,
								"mpris:artUrl": (albumArt && (albumArt[1] || albumArt[0])) || "",
								"xesam:title": song.title || song.name || "",
								"xesam:album": song.album || "",
								"xesam:artist": [song.artist || song.albumArtist || ""],
							});
						});
						this.mpc.status.subscribe((status) => {
							this.ipc.send("mpris:state", status.state);
						});
					});
				this.ipc.on("mpris:next", () => this.mpc.playback.next());
				this.ipc.on("mpris:previous", () => this.mpc.playback.previous());
				this.ipc.on("mpris:playpause", () => {
					this.mpc.status.subscribe((status) => {
						if (status.state !== "play") {
							this.mpc.playback.play();
						} else {
							this.mpc.playback.pause();
						}
					});
				});
				this.ipc.on("mpris:pause", () => {
					this.mpc.playback.pause();
				});
				this.ipc.on("mpris:play", () => {
					this.mpc.playback.play();
				});
				this.ipc.on("mpris:stop", () => {
					this.mpc.playback.stop();
				});
			}
		});
	}
}
