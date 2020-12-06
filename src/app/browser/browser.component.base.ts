import { NgZone } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Directory, Song, Playlist } from "mpc-js-web";
import * as path from "path-browserify";

import { Ref } from "@src/app/types/ref";
import { Track, MopidyTrack, TlTrack } from "@src/app/types/track";
import { track2track, song2track } from "@src/app/functions/track";
import { GridItem, GridType, GridEvent } from "@src/app/core/components/browser-grid/browser-grid.component.base";
import { MpcService } from "@src/app/services/mpc.service";
import { ArtService } from "@src/app/services/art.service";
import { MopidyPlaylist } from "../types/playlist";


export class BrowserBase {
	public mopidy: boolean;
	public items: GridItem[];
	public tracks: Track[];
	public uri: string;
	public covers: { [album: string]: string[] } = {};
	public artists: { [artist: string]: string[] } = {};

	constructor(
		protected zone: NgZone,
		protected route: ActivatedRoute,
		protected mpc: MpcService,
		protected art: ArtService,
	) { }

	init(): void {
		this.route.queryParamMap.subscribe((query) => {
			this.uri = query.get("uri");
			this.uri = !!this.uri ? decodeURIComponent(this.uri) : null;
			if (this.mopidy) {
				this.loadMopidy();
			} else {
				this.loadMPD();
				this.mpc.socket.on("changed-database", () => this.zone.run(() => this.loadMPD()));
			}
		});
	}

	loadMopidy(): void {
		this.tracks = null;
		this.items = null;
		this.mpc.socket.library.browse([this.uri]).then((refs: Ref[]) => {
			this.items = refs.filter((r) => r.type !== "track").map((r) => ({
				name: r.name,
				type: GridType[r.type],
				uri: r.uri,
			}));
			let tracks: MopidyTrack[] = [];
			const uris = refs.filter((r) => r.type === "track").map((r) => r.uri);
			if (uris && uris.length > 0) {
				this.tracks = [];
			}
			this.mpc.socket.library.lookup([uris]).then((mtracks: { [uri: string]: MopidyTrack[] }) => {
				for (const mts of Object.values(mtracks)) {
					tracks = tracks.concat(mts);
				}
				const out = [];
				for (const t of tracks) {
					try {
						out.push(track2track(t));
					} catch (e) {
						//
					}
				}
				this.tracks = out;
			});

			const albums: string[] = [];
			const artists: string[] = [];
			for (const ref of refs) {
				switch (ref.type) {
					case "album":
						albums.push(ref.name);
						break;
					case "artist":
						artists.push(ref.name);
				}
			}
			const covers: { [album: string]: string[] } = {};
			const artist: { [artist: string]: string[] } = {};
			const promises = [];
			for (const album of albums) {
				promises.push(this.art.getArt("", album, true).then((arts) => covers[album] = arts));
			}
			for (const a of artists) {
				promises.push(this.art.getArt(a, null, true).then((arts) => artist[a] = arts));
			}
			Promise.all(promises).then(() => {
				this.covers = covers;
				this.artists = artist;
			});
		});
	}

	loadMPD(): void {
		this.tracks = null;
		this.items = null;
		this.mpc.socket.database.listInfo(this.uri).then((refs: (Song | Directory | Playlist)[]) => {
			this.items = refs.filter((r) => r.entryType !== "song").map((r) => ({
				name: path.basename(r.path),
				type: r.entryType === "directory" ? GridType.directory : GridType.playlist,
				uri: r.path,
			}));
			this.tracks = refs.filter((r) => r.entryType === "song").map((r) => song2track(<Song> r));
		});
	}

	navigate(uri: string): void { }

	private async recurseURIs(refs: Ref[]): Promise<string[]> {
		let uris = [];
		for (const ref of refs) {
			if (ref.type === "track") {
				uris.push(ref.uri);
			} else {
				uris = uris.concat(await this.recurseURIs(await this.mpc.socket.library.browse([ref.uri])));
			}
		}
		return uris;
	}

	private async recurseTracks(refs: Ref[]): Promise<MopidyTrack[]> {
		let tracks: MopidyTrack[] = [];
		for (const ref of refs) {
			if (ref.type === "track") {
				tracks.push({ __model__: "Track", name: ref.name, uri: ref.uri } as unknown as MopidyTrack);
			} else {
				tracks = tracks.concat(await this.recurseTracks(await this.mpc.socket.library.browse([ref.uri])));
			}
		}
		return tracks;
	}

	onInput(event: GridEvent): void {
		switch (event.action) {
			case "navigate":
				this.navigate(event.payload.uri);
				break;
			case "play":
				if (this.mopidy) {
					this.mpc.socket.tracklist.clear().then(() => {
						this.mpc.socket.library.browse([event.payload.uri]).then((refs: Ref[]) => {
							this.recurseURIs(refs).then((uris) => this.mpc.socket.tracklist.add([null, null, uris]))
								.then((tlTracks: TlTrack[]) => this.mpc.socket.playback.play([tlTracks[0]]));
						});
					});
				} else {
					this.mpc.socket.currentPlaylist.clear().then(() => {
						this.mpc.socket.currentPlaylist.add(event.payload.uri).then(() => {
							this.mpc.socket.playback.play();
						});
					});
				}
				break;
			case "queue":
				if (this.mopidy) {
					this.mpc.socket.library.browse([event.payload.uri]).then((refs: Ref[]) => {
						this.recurseURIs(refs).then((uris) => this.mpc.socket.tracklist.add([null, null, uris]));
					});
				} else {
					this.mpc.socket.currentPlaylist.add(event.payload.uri);
				}
				break;
			case "playlist":
				if (event.payload.name !== undefined) {
					if (this.mopidy) {
						this.mpc.socket.library.browse([event.payload.uri]).then((refs: Ref[]) => {
							const scheme = event.payload.uri.slice(0, event.payload.uri.indexOf(":"));
							this.recurseTracks(refs).then((tracks) => {
								this.mpc.socket.playlists.create([event.payload.name, scheme]).then((pls: MopidyPlaylist) => {
									pls.tracks = tracks;
									this.mpc.socket.playlists.save([pls]);
								});
							});
						});
					} else {
						this.mpc.socket.storedPlaylists.playlistAdd(event.payload.name, event.payload.uri);
					}
				} else if (event.payload.target !== undefined) {
					if (this.mopidy) {
						this.mpc.socket.library.browse([event.payload.uri]).then((refs: Ref[]) => {
							this.recurseTracks(refs).then((tracks) => {
								this.mpc.socket.playlists.lookup([event.payload.target]).then((pls: MopidyPlaylist) => {
									pls.tracks = pls.tracks.concat(tracks);
									this.mpc.socket.playlists.save([pls]);
								});
							});
						});
					} else {
						this.mpc.socket.storedPlaylists.playlistAdd(event.payload.target, event.payload.uri);
					}
				}
		}
	}
}
