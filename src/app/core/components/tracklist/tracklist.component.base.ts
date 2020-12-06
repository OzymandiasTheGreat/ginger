import { Component, OnInit, OnChanges, Input, NgZone, SimpleChanges } from "@angular/core";
import { PlaylistItem, StoredPlaylist } from "mpc-js-web";

import { Track, TlTrack } from "@src/app/types/track";
import { MopidyPlaylist } from "@src/app/types/playlist";
import { MpcService } from "@src/app/services/mpc.service";
import { ArtService } from "@src/app/services/art.service";


@Component({
	selector: "app-tracklist-base",
	template: "",
})
export class TracklistBaseComponent implements OnInit, OnChanges {
	@Input() public tracks: Track[];
	@Input() public type: "queue" | "playlist" | "browser";
	public mopidy: boolean;
	public currentTrack: Track;
	@Input() public currentPlaylist: MopidyPlaylist | StoredPlaylist;
	public covers: { [key: string]: string[] } = {};
	public artists: { [key: string]: string[] } = {};

	constructor(
		protected zone: NgZone,
		public mpc: MpcService,
		public art: ArtService,
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

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.tracks.currentValue !== changes.tracks.previousValue) {
			this.getCovers();
			this.getArtists();
		}
	}

	getCovers(): void {
		const promises = [];
		for (const track of this.tracks) {
			promises.push(this.art.getArt(track.albumArtist.title, track.album.title, false));
		}
		Promise.all(promises).then((arts) => {
			const covers = {};
			for (let i = 0; i < arts.length; i++) {
				covers[this.tracks[i].album.title] = arts[i];
			}
			this.covers = covers;
		});
	}

	getArtists(): void {
		const promises = [];
		for (const track of this.tracks) {
			promises.push(this.art.getArt(track.albumArtist.title, null, false));
		}
		Promise.all(promises).then((arts) => {
			const artists = {};
			for (let i = 0; i < arts.length; i++) {
				artists[this.tracks[i].albumArtist.title] = arts[i];
			}
			this.artists = artists;
		});
	}

	play(track?: Track): void {
		if (this.type === "queue") {
			if (this.mopidy) {
				this.mpc.socket.playback.play([null, track?.id]);
			} else {
				if (track) {
					this.mpc.socket.playback.playId(track.id);
				} else {
					this.mpc.socket.playback.play();
				}
			}
		} else {
			if (track) {
				if (this.mopidy) {
					this.mpc.socket.tracklist.add([null, null, [track.uri]]).then((tlTracks: TlTrack[]) => {
						this.mpc.socket.playback.play([null, tlTracks[0].tlid]);
					});
				} else {
					this.mpc.socket.currentPlaylist.addId(track.uri).then((id: number) => {
						this.mpc.socket.playback.playId(id);
					});
				}
			} else {
				if (this.mopidy) {
					this.mpc.socket.tracklist.clear().then(() => {
						this.mpc.socket.tracklist.add([null, null, this.tracks.map((t) => t.uri)]).then(() => {
							this.mpc.socket.playback.play();
						});
					});
				} else {
					this.mpc.socket.currentPlaylist.clear().then(() => {
						const promises = [];
						for (const trck of this.tracks) {
							promises.push(this.mpc.socket.currentPlaylist.add(trck.uri));
						}
						Promise.all(promises).then(() => this.mpc.socket.playback.play());
					});
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
		} else if (this.type === "playlist") {
			if (this.mopidy) {
				for (const track of tracks) {
					const index = (<MopidyPlaylist> this.currentPlaylist).tracks.findIndex((t) => t.uri === track.uri);
					(<MopidyPlaylist> this.currentPlaylist).tracks.splice(index, 1);
				}
				this.mpc.socket.playlists.save([this.currentPlaylist]);
			} else {
				for (const track of tracks) {
					this.mpc.socket.storedPlaylists.playlistDelete(this.currentPlaylist.name, this.tracks.findIndex((t) => t.uri === track.uri));
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
		} else if (this.type === "playlist") {
			if (this.mopidy) {
				(<MopidyPlaylist> this.currentPlaylist).tracks = [];
				this.mpc.socket.playlists.save([this.currentPlaylist]);
			} else {
				for (let i = 0; i < this.tracks.length; i++) {
					this.mpc.socket.storedPlaylists.playlistDelete(this.currentPlaylist.name, i);
				}
			}
		}
	}

	queue(tracks: Track[]): void {
		if (this.mopidy) {
			this.mpc.socket.tracklist.add([null, null, tracks.map((t) => t.uri)]);
		} else {
			for (const track of tracks) {
				this.mpc.socket.currentPlaylist.add(track.uri);
			}
		}
	}
}
