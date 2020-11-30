import { Component, OnInit, Input, NgZone } from "@angular/core";
import { PlaylistItem } from "mpc-js-web";

import { Track, TlTrack } from "@src/app/types/track";
import { MpcService } from "@src/app/services/mpc.service";


@Component({
	selector: "app-tracklist-base",
	template: "",
})
export class TracklistBaseComponent implements OnInit {
	@Input() public tracks: Track[];
	@Input() public type: "queue";
	public mopidy: boolean;
	public currentTrack: Track;

	constructor(
		protected zone: NgZone,
		public mpc: MpcService,
	) {}

	ngOnInit(): void {
		if (this.type === "queue") {
			if (this.mopidy) {
				this.mpc.socket.playback.getCurrentTlTrack().then((track: TlTrack) => {
					if (track) {
						this.currentTrack = {
							id: track.tlid,
							uri: track.track.uri,
							title: track.track.name,
							artist: {
								title: track.track.artists.map((a) => a.name).join(", "),
								id: track.track.artists[0].uri,
							},
							album: {
								title: track.track.album.name,
								id: track.track.album.uri,
							},
							albumArtist: {
								title: track.track.artists[0].name,
								id: track.track.artists[0].uri,
							},
							date: track.track.date,
							genre: track.track.genre,
							track_no: track.track.track_no,
							disc_no: track.track.disc_no,
							art: [],
						};
					}
				});

				this.mpc.socket.on("event:trackPlaybackStarted", ({ tl_track }) => {
					this.zone.run(() => {
						if (tl_track) {
							const track: TlTrack = <TlTrack> tl_track;
							this.currentTrack = {
								id: track.tlid,
								uri: track.track.uri,
								title: track.track.name,
								artist: {
									title: track.track.artists.map((a) => a.name).join(", "),
									id: track.track.artists[0].uri,
								},
								album: {
									title: track.track.album.name,
									id: track.track.album.uri,
								},
								albumArtist: {
									title: track.track.artists[0].name,
									id: track.track.artists[0].uri,
								},
								date: track.track.date,
								genre: track.track.genre,
								track_no: track.track.track_no,
								disc_no: track.track.disc_no,
								art: [],
							};
						}
					});
				});
			} else {
				this.mpc.socket.status.currentSong().then((song: PlaylistItem) => {
					if (song) {
						this.currentTrack = {
							id: song.id,
							uri: song.path,
							title: song.title || song.name,
							artist: {
								title: song.artist,
								id: song.artist,
							},
							album: {
								title: song.album,
								id: song.album,
							},
							albumArtist: {
								title: song.albumArtist,
								id: song.albumArtist,
							},
							date: song.date,
							genre: song.genre,
							track_no: song.track,
							disc_no: "",
							art: [],
						};
					} else {
						this.currentTrack = null;
					}
				});

				this.mpc.socket.on("changed-player", () => {
					this.zone.run(() => {
						this.mpc.socket.status.currentSong().then((song: PlaylistItem) => {
							if (song) {
								this.currentTrack = {
									id: song.id,
									uri: song.path,
									title: song.title || song.name,
									artist: {
										title: song.artist,
										id: song.artist,
									},
									album: {
										title: song.album,
										id: song.album,
									},
									albumArtist: {
										title: song.albumArtist,
										id: song.albumArtist,
									},
									date: song.date,
									genre: song.genre,
									track_no: song.track,
									disc_no: "",
									art: [],
								};
							} else {
								this.currentTrack = null;
							}
						});
					});
				});
			}
		}
	}

	play(track?: Track): void {
		if (this.type === "queue") {
			if (this.mopidy) {
				this.mpc.socket.playback.play([null, track && track.id]);
			} else {
				if (track) {
					this.mpc.socket.playback.playId(track.id);
				} else {
					this.mpc.socket.playback.play();
				}
			}
		}
	}

	remove(tracks: Track[]): void {
		if (this.type === "queue") {
			if (this.mopidy) {
				this.mpc.socket.tracklist.remove([{ "tlid": tracks.map((t) => t.id) }]);
			} else {
				for (const track of tracks) {
					this.mpc.socket.currentPlaylist.deleteId(track.id);
				}
			}
		}
	}

	clear(): void {
		if (this.type === "queue") {
			if (this.mopidy) {
				this.mpc.socket.tracklist.clear();
			} else {
				this.mpc.socket.currentPlaylist.clear();
			}
		}
	}
}
