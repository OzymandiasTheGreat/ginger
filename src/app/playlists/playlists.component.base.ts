import { Component, OnInit } from "@angular/core";
import { PlaylistItem } from "mpc-js-web";

import { Ref } from "@src/app/types/ref";
import { Track, MopidyTrack } from "@src/app/types/track";
import { MopidyPlaylist } from "@src/app/types/playlist";
import { GridType, GridEvent, GridItem } from "@src/app/core/components/browser-grid/browser-grid.component.base";
import { PlaylistService } from "@src/app/services/playlist.service";
import { MpcService } from "@src/app/services/mpc.service";


@Component({
	selector: "app-playlists-base",
	template: "",
})
export class PlaylistsBaseComponent implements OnInit {
	public mopidy: boolean;
	public gridType: GridType = GridType.playlist;
	public playlists: GridItem[];

	constructor(
		public pls: PlaylistService,
		public mpc: MpcService,
	) { }

	ngOnInit(): void {
		this.playlists = this.pls.playlists?.map((p) => ({
			name: p.name,
			uri: p.uri,
			type: GridType.playlist,
		}));
		this.pls.updated.subscribe(() => {
			this.playlists = this.pls.playlists.map((p) => ({
				name: p.name,
				uri: p.uri,
				type: GridType.playlist,
			}));
		});
	}

	onInput(args: GridEvent): void {
		switch (args.action) {
			case "play":
				if (this.mopidy) {
					this.mpc.socket.tracklist.clear().then(() => {
						this.mpc.socket.playlists.getItems([args.payload.uri]).then((uris: Ref[]) => {
							this.mpc.socket.tracklist.add([null, null, uris.map((u) => u.uri)]).then(() => {
								this.mpc.socket.playback.play();
							});
						});
					});
				} else {
					this.mpc.socket.currentPlaylist.clear().then(() => {
						this.mpc.socket.storedPlaylists.load(args.payload.uri).then(() => {
							this.mpc.socket.playback.play();
						});
					});
				}
				break;
			case "queue":
				if (this.mopidy) {
					this.mpc.socket.playlists.getItems([args.payload.uri]).then((uris: Ref[]) => {
						this.mpc.socket.tracklist.add([null, null, uris.map((u) => u.uri)]);
					});
				} else {
					this.mpc.socket.storedPlaylists.load(args.payload.uri);
				}
				break;
			case "playlist":
				if (args.payload.name !== undefined) {
					if (this.mopidy) {
						this.mpc.socket.playlists.lookup([args.payload.uri]).then((playlist: MopidyPlaylist) => {
							const scheme = playlist.uri.slice(0, playlist.uri.indexOf(":"));
							this.mpc.socket.playlists.create([args.payload.name, scheme]).then((new_pls: MopidyPlaylist) => {
								new_pls.tracks = playlist.tracks;
								this.mpc.socket.playlists.save([new_pls]);
							});
						});
					} else {
						this.mpc.socket.storedPlaylists.listPlaylistInfo(args.payload.uri).then((playlist: PlaylistItem[]) => {
							for (const track of playlist) {
								this.mpc.socket.storedPlaylists.playlistAdd(args.payload.name, track.path);
							}
						});
					}
				} else if (args.payload.target !== undefined) {
					if (this.mopidy) {
						this.mpc.socket.playlists.lookup([args.payload.uri]).then((source: MopidyPlaylist) => {
							this.mpc.socket.playlists.lookup([args.payload.target]).then((target: MopidyPlaylist) => {
								target.tracks = target.tracks.concat(source.tracks);
								this.mpc.socket.playlists.save([target]);
							});
						});
					} else {
						this.mpc.socket.storedPlaylists.listPlaylistInfo(args.payload.uri).then((source: PlaylistItem[]) => {
							for (const track of source) {
								this.mpc.socket.storedPlaylists.playlistAdd(args.payload.target, track.path);
							}
						});
					}
				}
				break;
			case "remove":
				if (this.mopidy) {
					this.mpc.socket.playlists.delete([args.payload.uri]);
				} else {
					this.mpc.socket.storedPlaylists.remove(args.payload.uri);
				}
				break;
			case "navigate":
				this.navigate(args.payload.uri);
		}
	}

	navigate(uri: string): void { }
}
