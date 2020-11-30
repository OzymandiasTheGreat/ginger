import { NgZone } from "@angular/core";
import { PlaylistItem, StoredPlaylist } from "mpc-js-web";

import { Ref } from "@src/app/types/ref";
import { MopidyPlaylist, Playlist } from "@src/app/types/playlist";
import { MopidyTrack, Track } from "@src/app/types/track";
import { MpcService } from "@src/app/services/mpc.service";


export class PlaylistBaseService {
	public mopidy: boolean;
	public playlists: Playlist[];

	constructor(
		protected zone: NgZone,
		protected mpc: MpcService,
	) { }

	protected load(): void {
		if (this.mopidy) {
			this.loadMopidy();

			this.mpc.socket.on("event:playlistChanged", () => {
				this.zone.run(() => this.loadMopidy());
			});
			this.mpc.socket.on("event:playlistDeleted", () => {
				this.zone.run(() => this.loadMopidy());
			});
		} else {
			this.loadMPD();

			this.mpc.socket.on("changed-playlist", () => {
				this.zone.run(() => this.loadMPD());
			});
		}
	}

	protected loadMopidy(): void {
		this.playlists = [];
		this.mpc.socket.playlists.asList().then((playlists: Ref[]) => {
			playlists.forEach((pls) => {
				if (pls.type === "playlist") {
					this.playlists.push({
						name: pls.name,
						uri: pls.uri,
					});
				}
			});
		});
	}

	protected loadMPD(): void {
		this.playlists = [];
		this.mpc.socket.storedPlaylists.listPlaylists().then((playlists: StoredPlaylist[]) => {
			playlists.forEach((pls) => {
				this.playlists.push({
					name: pls.name,
					uri: pls.name,
				});
			});
		});
	}

	create(name: string, tracks: Track[]): void {
		if (this.mopidy) {
			const index = tracks[0].uri.indexOf(":");
			const scheme = tracks[0].uri.slice(0, index);
			this.mpc.socket.playlists.create([name, scheme]).then((pls: MopidyPlaylist) => {
				pls.tracks = <MopidyTrack[]> <unknown> tracks.map((t) => ({ "__model__": "Track", name: t.title, uri: t.uri }));
				this.mpc.socket.playlists.save([pls]);
			});
		} else {
			for (const track of tracks) {
				this.mpc.socket.storedPlaylists.playlistAdd(name, track.uri);
			}
		}
	}

	add(uri: string, tracks: Track[]): void {
		if (this.mopidy) {
			this.mpc.socket.playlists.lookup([uri]).then((pls: MopidyPlaylist) => {
				if (pls) {
					pls.tracks = pls.tracks.concat(<MopidyTrack[]> <unknown> tracks.map((t) => ({ "__model__": "Track", name: t.title, uri: t.uri })));
					this.mpc.socket.playlists.save([pls]);
				}
			});
		} else {
			for (const track of tracks) {
				this.mpc.socket.storedPlaylists.playlistAdd(uri, track.uri);
			}
		}
	}

	remove(uri: string, tracks: Track[]): void {
		if (this.mopidy) {
			this.mpc.socket.playlists.lookup([uri]).then((pls: MopidyPlaylist) => {
				if (pls) {
					pls.tracks = pls.tracks.filter((t) => !tracks.find((rt) => rt.uri === t.uri));
					this.mpc.socket.playlists.save([pls]);
				}
			});
		} else {
			this.mpc.socket.storedPlaylists.listPlaylistInfo(uri).then((pls: PlaylistItem[]) => {
				let offset = 0;
				for (const track of tracks) {
					const index = pls.findIndex((pi) => pi.path === track.uri);
					if (index > -1) {
						this.mpc.socket.storedPlaylists.playlistDelete(uri, index + offset);
						offset++;
					}
				}
			});
		}
	}

	clear(uri: string): void {
		if (this.mopidy) {
			this.mpc.socket.playlists.lookup([uri]).then((pls: MopidyPlaylist) => {
				if (pls) {
					pls.tracks = [];
					this.mpc.socket.playlists.save([pls]);
				}
			});
		} else {
			this.mpc.socket.storedPlaylists.playlistClear(uri);
		}
	}

	delete(uri: string): void {
		if (this.mopidy) {
			this.mpc.socket.playlists.delete([uri]);
		} else {
			this.mpc.socket.storedPlaylists.remove(uri);
		}
	}

	rename(uri: string, name: string): void {
		if (this.mopidy) {
			this.mpc.socket.playlists.lookup([uri]).then((pls: MopidyPlaylist) => {
				if (pls) {
					pls.name = name;
					this.mpc.socket.playlists.save([pls]);
				}
			});
		} else {
			this.mpc.socket.storedPlaylists.rename(uri, name);
		}
	}

	queue(uri: string): void {
		if (this.mopidy) {
			this.mpc.socket.playlists.lookup([uri]).then((pls: MopidyPlaylist) => {
				if (pls) {
					this.mpc.socket.tracklist.add([null, null, pls.tracks.map((t) => t.uri)]);
				}
			});
		} else {
			this.mpc.socket.storedPlaylists.load(uri);
		}
	}
}
