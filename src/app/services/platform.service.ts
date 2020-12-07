import { Injectable } from "@angular/core";
import { PlaylistItem, Status } from "mpc-js-web";

import { CURRENT_MOPIDY } from "@src/app/types/constants";
import { MpcService } from "@src/app/services/mpc.service";
import { ArtService } from "@src/app/services/art.service";
import { MopidyTrack } from "../types/track";


declare const MediaMetadata: any;


@Injectable({
	providedIn: "root"
})
export class PlatformService {
	public audio: HTMLAudioElement;
	public mopidy: boolean;

	constructor(
		protected mpc: MpcService,
		protected art: ArtService,
	) {
		this.audio = <HTMLAudioElement> document.getElementById("media-fix");
		this.mpc.connection.subscribe((conn) => {
			if (conn) {
				this.mopidy = JSON.parse(window.localStorage.getItem(CURRENT_MOPIDY));
				if (this.mopidy) {
					this.mpc.socket.playback.getCurrentTrack().then((track: MopidyTrack) => {
						this.art.getArt(track.artists[0].name, track.album.name, true).then((arts) => {
							(<any> navigator).mediaSession.metadata = new MediaMetadata({
								title: track.name,
								artist: track.artists.map((a) => a.name).join(", "),
								album: track.album.name,
								artwork: arts.map((a) => ({ src: a })),
							});
						});
					});

					this.mpc.socket.on("event:playbackStateChanged", (state) => {
						switch (state.new_state) {
							case "playing":
								(<any> navigator).mediaSession.playbackState = "playing";
								break;
							case "paused":
								(<any> navigator).mediaSession.playbackState = "paused";
								break;
							case "stopped":
								(<any> navigator).mediaSession.playbackState = "none";
						}
					});
					this.mpc.socket.on("event:trackPlaybackStarted", ({ tl_track }) => {
						this.art.getArt(tl_track.track.artists[0].name, tl_track.track.album.name, true).then((arts) => {
							(<any> navigator).mediaSession.metadata = new MediaMetadata({
								title: tl_track.track.name,
								artist: tl_track.track.artists.map((a) => a.name).join(", "),
								album: tl_track.track.album.name,
								artwork: arts.map((a) => ({ src: a })),
							});
						});
					})
				} else {
					this.mpc.socket.status.currentSong().then((track: PlaylistItem) => {
						this.art.getArt(track.albumArtist, track.album, true).then((arts) => {
							(<any> navigator).mediaSession.metadata = new MediaMetadata({
								title: track.title || track.name,
								artist: track.artist,
								album: track.album,
								artwork: arts.map((a) => ({ src: a })),
							});
						});
					});

					this.mpc.socket.on("changed-player", () => {
						this.mpc.socket.status.status().then((status: Status) => {
							switch (status.state) {
								case "play":
									(<any> navigator).mediaSession.playbackState = "playing";
									break;
								case "pause":
									(<any> navigator).mediaSession.playbackState = "paused";
									break;
								case "stop":
									(<any> navigator).mediaSession.playbackState = "none";
							}
						});
						this.mpc.socket.status.currentSong().then((track: PlaylistItem) => {
							this.art.getArt(track.albumArtist, track.album, true).then((arts) => {
								(<any> navigator).mediaSession.metadata = new MediaMetadata({
									title: track.title || track.name,
									artist: track.artist,
									album: track.album,
									artwork: arts.map((a) => ({ src: a })),
								});
							});
						});
					});
				}
			}
		});
	}

	setup(): void {
		this.audio.volume = 0.1;
		this.audio.play().then(() => {
			setTimeout(() => {
				this.audio.muted = true;
			}, 250);
			(<any> navigator).mediaSession.setActionHandler("play", () => this.play());
			(<any> navigator).mediaSession.setActionHandler("pause", () => this.pause());
			(<any> navigator).mediaSession.setActionHandler("stop", () => this.stop());
			(<any> navigator).mediaSession.setActionHandler("previoustrack", () => this.previoustrack());
			(<any> navigator).mediaSession.setActionHandler("nexttrack", () => this.nexttrack());
			if (this.mopidy) {
				//
			} else {
				this.mpc.socket?.status?.status().then((status: Status) => {
					switch (status.state) {
						case "play":
							(<any> navigator).mediaSession.playbackState = "playing";
							break;
						case "pause":
							(<any> navigator).mediaSession.playbackState = "paused";
							break;
						case "stop":
							(<any> navigator).mediaSession.playbackState = "none";
					}
				});
			}
		});
	}

	play(): void {
		this.audio.play().then(() => {
			this.audio.muted = false;
			setTimeout(() => {
				this.audio.muted = true;
			}, 250);
			(<any> navigator).mediaSession.playbackState = "playing";
			this.mpc.socket.playback.play();
		});
	}

	pause(): void {
		this.audio.pause();
		(<any> navigator).mediaSession.playbackState = "paused";
		this.mpc.socket.playback.pause();
	}

	stop(): void {
		this.audio.pause();
		(<any> navigator).mediaSession.playbackState = "none";
		this.mpc.socket.playback.stop();
	}

	previoustrack(): void {
		this.audio.play().then(() => {
			this.audio.muted = false;
			setTimeout(() => {
				this.audio.muted = true;
			}, 250);
		});
		(<any> navigator).mediaSession.playbackState = "playing";
		this.mpc.socket.playback.previous();
	}

	nexttrack(): void {
		this.audio.play().then(() => {
			this.audio.muted = false;
			setTimeout(() => {
				this.audio.muted = true;
			}, 250);
		});
		(<any> navigator).mediaSession.playbackState = "playing";
		this.mpc.socket.playback.next();
	}
}
