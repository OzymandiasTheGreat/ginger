import { NgZone } from "@angular/core";
import { PlaylistItem } from "mpc-js-web";

import { Track, TlTrack } from "@src/app/types/track";
import { MpcService } from "@src/app/services/mpc.service";
import { ArtService } from "@src/app/services/art.service";


export class QueueBase {
	public mopidy: boolean;
	public tracklist: Track[];

	constructor(
		protected zone: NgZone,
		public mpc: MpcService,
		public art: ArtService,
	) { }

	load(): void {
		let tracklist: Track[] = [];
		if (this.mopidy) {
			this.mpc.socket.tracklist.getTlTracks().then((tlTracks: TlTrack[]) => {
				tlTracks.forEach(async (track) => tracklist.push({
					id: track.tlid,
					uri: track.track.uri,
					title: track.track.name,
					artist: {
						title: track.track.artists.map((a) => a.name).join(", "),
						id: track.track.artists[0].uri,
					},
					albumArtist: {
						title: track.track.artists[0].name,
						id: track.track.artists[0].uri,
					},
					album: {
						title: track.track.album.name,
						id: track.track.album.uri,
					},
					genre: track.track.genre,
					track_no: track.track.track_no,
					disc_no: track.track.disc_no,
					date: track.track.date,
					art: await this.art.getArt(track.track.artists[0].name, track.track.album.name, false),
				} as Track));
				this.tracklist = tracklist;
			});

			this.mpc.socket.on("event:tracklistChanged", () => {
				this.zone.run(() => {
					tracklist = [];
					this.mpc.socket.tracklist.getTlTracks().then((tlTracks: TlTrack[]) => {
						tlTracks.forEach(async (track) => tracklist.push({
							id: track.tlid,
							uri: track.track.uri,
							title: track.track.name,
							artist: {
								title: track.track.artists.map((a) => a.name).join(", "),
								id: track.track.artists[0].uri,
							},
							albumArtist: {
								title: track.track.artists[0].name,
								id: track.track.artists[0].uri,
							},
							album: {
								title: track.track.album.name,
								id: track.track.album.uri,
							},
							genre: track.track.genre,
							track_no: track.track.track_no,
							disc_no: track.track.disc_no,
							date: track.track.date,
							art: await this.art.getArt(track.track.artists[0].name, track.track.album.name, false),
						} as Track));
						this.tracklist = tracklist;
					});
				});
			});
		} else {
			this.mpc.socket.currentPlaylist.playlistInfo().then((info: PlaylistItem[]) => {
				info.forEach(async (song) => tracklist.push({
					id: song.id,
					uri: song.path,
					title: song.title || song.name,
					artist: {
						title: song.artist,
						id: song.artist,
					},
					albumArtist: {
						title: song.albumArtist,
						id: song.albumArtist,
					},
					album: {
						title: song.album,
						id: song.album,
					},
					genre: song.genre,
					track_no: song.track,
					disc_no: "",
					date: song.date,
					art: await this.art.getArt(song.albumArtist || song.artist, song.album, false),
				}));
				this.tracklist = tracklist;
			});

			this.mpc.socket.on("changed-playlist", () => {
				this.zone.run(() => {
					tracklist = [];
					this.mpc.socket.currentPlaylist.playlistInfo().then((info: PlaylistItem[]) => {
						info.forEach(async (song) => tracklist.push({
							id: song.id,
							uri: song.path,
							title: song.title || song.name,
							artist: {
								title: song.artist,
								id: song.artist,
							},
							albumArtist: {
								title: song.albumArtist,
								id: song.albumArtist,
							},
							album: {
								title: song.album,
								id: song.album,
							},
							genre: song.genre,
							track_no: song.track,
							disc_no: "",
							date: song.date,
							art: await this.art.getArt(song.albumArtist || song.artist, song.album, false),
						}));
						this.tracklist = tracklist;
					});
				});
			});
		}
	}
}
