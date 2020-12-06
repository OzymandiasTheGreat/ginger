import { NgZone } from "@angular/core";

import { MpcService } from "@src/app/services/mpc.service";
import { ArtService } from "@src/app/services/art.service";


export class PlaybackBase {
	public mopidy: boolean;
	public enabled = false;
	public playing: boolean;
	public track: { artist: string, title: string, album: string };
	public trackLength: number;
	public trackPos: number;
	public seekTimer: any;
	public seeking: boolean;
	public artURIs: string[] = [];

	constructor(
		protected zone: NgZone,
		public mpc: MpcService,
		public art: ArtService,
	) { }

	setup(): void {
		this.track = <any> {};

		if (this.mopidy) {
			this.zone.run(() => {
				this.mpc.socket.playback.getCurrentTrack().then((track) => {
					if (track) {
						this.track.title = track.name;
						this.track.artist = track.artists.map((a) => a.name).join(", ");
						this.track.album = track.album.name;
						this.trackLength = track.length / 1000;
						this.mpc.socket.playback.getTimePosition().then((pos) => this.trackPos = pos / 1000);
						this.art.getArt(track.artists[0].name, track.album.name, false)
							.then((arts) => this.artURIs = arts);
					}
				});
				this.mpc.socket.playback.getState().then((state) => {
					this.playing = state === "playing";
					if (this.playing) {
						this.seekTimer = setInterval(() => this.trackPos += 1, 1000);
					} else {
						clearInterval(this.seekTimer);
					}
				});
			});

			this.mpc.socket.on("event:playbackStateChanged", (state) => {
				this.zone.run(() => {
					this.playing = state.new_state === "playing";
					clearInterval(this.seekTimer);
					if (this.playing) {
						this.seekTimer = setInterval(() => this.trackPos += 1, 1000);
					}
				});
			});

			this.mpc.socket.on("event:trackPlaybackStarted", ({ tl_track }) => {
				this.zone.run(() => {
					this.track.title = tl_track.track.name;
					this.track.artist = tl_track.track.artists.map((a) => a.name).join(", ");
					this.track.album = tl_track.track.album.name;
					this.trackLength = tl_track.track.length / 1000;
					this.art.getArt(tl_track.track.artists[0].name, tl_track.track.album.name, false)
						.then((arts) => this.artURIs = arts);
				});
				this.mpc.socket.playback.getTimePosition().then((pos) => this.trackPos = pos / 1000);
			});
		} else {
			this.zone.run(() => {
				this.mpc.socket.status?.currentSong().then((song) => {
					if (song) {
						this.track.title = song.title || song.name;
						this.track.artist = song.artist;
						this.track.album = song.album;
						this.trackLength = song.duration;
						this.trackPos = song.position;
						this.art.getArt(song.artist, song.album, false)
							.then((arts) => this.artURIs = arts);
					}
				});

				this.mpc.socket.status.status().then(({ state }) => {
					this.playing = state === "play";
					if (this.playing) {
						this.seekTimer = setInterval(() => this.trackPos += 1, 1000);
					} else {
						clearInterval(this.seekTimer);
					}
				});
			});

			this.mpc.socket.on("changed-player", () => {
				this.zone.run(() => {
					this.mpc.socket.status.status().then(({ state }) => {
						this.playing = state === "play";
						clearInterval(this.seekTimer);
						if (this.playing) {
							this.seekTimer = setInterval(() => this.trackPos += 1, 1000);
						}
					});

					this.mpc.socket.status.currentSong().then((song) => {
						if (song) {
							this.track.title = song.title || song.name;
							this.track.artist = song.artist;
							this.track.album = song.album;
							this.trackLength = song.duration;
							this.trackPos = song.position;
							this.art.getArt(song.artist, song.album, false)
								.then((arts) => this.artURIs = arts);
						}
					});
				});
			});
		}
	}

	play(): void {
		this.mpc.socket.playback.play();
	}

	pause(): void {
		this.mpc.socket.playback.pause();
	}

	stop(): void {
		this.mpc.socket.playback.stop();
	}

	prev(): void {
		this.mpc.socket.playback.previous();
	}

	next(): void {
		this.mpc.socket.playback.next();
	}
}
