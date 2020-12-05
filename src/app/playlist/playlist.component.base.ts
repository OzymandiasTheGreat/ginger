import { Component, OnInit, NgZone } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PlaylistItem, StoredPlaylist } from "mpc-js-web";

import { MpcService } from "@src/app/services/mpc.service";
import { MopidyPlaylist } from "@src/app/types/playlist";
import { Track } from "@src/app/types/track";
import { track2track, playlistItem2track } from "@src/app/functions/track";


@Component({
	selector: "app-playlist-base",
	template: "",
})
export class PlaylistBaseComponent implements OnInit {
	public mopidy: boolean;
	public currentPlaylist: MopidyPlaylist | StoredPlaylist;
	public tracks: Track[];

	constructor(
		protected zone: NgZone,
		protected route: ActivatedRoute,
		protected mpc: MpcService,
	) { }

	ngOnInit(): void {
		this.route.paramMap.subscribe((params) => {
			const uri = decodeURIComponent(params.get("id"));
			if (this.mopidy) {
				this.mpc.socket.playlists.lookup([uri]).then((pls: MopidyPlaylist) => {
					this.currentPlaylist = pls;

					const tracks: Track[] = [];
					pls.tracks.forEach((t) => tracks.push(track2track(t)));
					this.tracks = tracks;
				});

				this.mpc.socket.on("event:playlistChanged", () => {
					this.zone.run(() => {
						this.mpc.socket.playlists.lookup([uri]).then((pls: MopidyPlaylist) => {
							this.currentPlaylist = pls;

							const tracks: Track[] = [];
							pls.tracks.forEach((t) => tracks.push(track2track(t)));
							this.tracks = tracks;
						});
					});
				});
			} else {
				this.mpc.socket.storedPlaylists.listPlaylistInfo(uri).then((pls: PlaylistItem[]) => {
					this.currentPlaylist = <StoredPlaylist> { name: uri, lastModified: null };

					const tracks: Track[] = [];
					pls.forEach((t) => tracks.push(playlistItem2track(t)));
					this.tracks = tracks;
				});

				this.mpc.socket.on("changed-playlist", () => {
					this.zone.run(() => {
						this.mpc.socket.storedPlaylists.listPlaylistInfo(uri).then((pls: PlaylistItem[]) => {
							const tracks: Track[] = [];
							pls.forEach((t) => tracks.push(playlistItem2track(t)));
							this.tracks = tracks;
						});
					});
				});
			}
		});
	}
}
