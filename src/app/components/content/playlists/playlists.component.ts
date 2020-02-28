import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { StoredPlaylist, PlaylistItem } from "mpc-js-web";

import { MpdService } from "../../../shared/services/mpd.service";
import { SearchService } from "../../../shared/services/search.service";
import { extractArtists } from "../../../shared/functions/album-extract";
import { PlaylistInputComponent } from "../../../shared/components/playlist-input/playlist-input.component";


@Component({
	selector: "app-playlists",
	templateUrl: "./playlists.component.html",
	styleUrls: ["./playlists.component.scss"]
})
export class PlaylistsComponent implements OnInit {
	public playlists: Array<[string, Array<[string, PlaylistItem[]]>]> = [];
	public sorted: Array<[string, Array<[string, PlaylistItem[]]>]>;
	public ramdomAlbums = {};

	constructor(
		private mpd: MpdService,
		private search: SearchService,
		private renameDialog: MatDialog,
	) { }

	public ngOnInit() {
		this.mpd.stored.list()
			.subscribe({
				next: (playlists: StoredPlaylist[]) => {
					for (const playlist of playlists) {
						this.mpd.stored.list(playlist.name)
							.subscribe({
								next: (songs: PlaylistItem[]) => {
									const albums = {};
									for (const song of songs) {
										if (song.album in albums) {
											albums[song.album].push(song);
										} else {
											albums[song.album] = [song];
										}
									}
									this.playlists.push([playlist.name, Object.entries(albums)]);
								},
								complete: () => {
									for (const [pls, albums] of this.playlists) {
										this.ramdomAlbums[pls] = this.getRandomAlbums(albums);
									}
									this.sorted = [...this.playlists];

									this.search.query.subscribe((query) => {
										query = query.toLowerCase();
										this.playlists = query.length > 0
											// tslint:disable-next-line:newline-per-chained-call
											? this.sorted.filter(([pls, albums]) => pls && pls.toLowerCase().includes(query))
											: [...this.sorted];
									});
								},
							});
					}
				}
			});
		this.mpd.on("changed-stored_playlist")
			.subscribe(() => {
				const newPlaylists: Array<[string, Array<[string, PlaylistItem[]]>]> = [];
				this.mpd.stored.list()
					.subscribe((playlists: StoredPlaylist[]) => {
						for (const playlist of playlists) {
							this.mpd.stored.list(playlist.name)
								.subscribe({
									next: (songs: PlaylistItem[]) => {
										const albums = {};
										for (const song of songs) {
											if (song.album in albums) {
												albums[song.album].push(song);
											} else {
												albums[song.album] = [song];
											}
										}
										newPlaylists.push([playlist.name, Object.entries(albums)]);
									},
									complete: () => {
										this.playlists = newPlaylists;
										this.ramdomAlbums = {};
										for (const pls of this.playlists) {
											this.ramdomAlbums[pls[0]] = this.getRandomAlbums(pls[1]);
										}
									},
								});
						}
					});
			});
	}

	public getRandomAlbums(playlist: Array<[string, PlaylistItem[]]>): Array<{artist: string, album: string}> {
		const randomAlbums: Array<{artist: string, album: string}> = [];
		for (let i = 0; randomAlbums.length < 4 && i < 12; i++) {
			const randomAlbum = playlist[Math.floor(Math.random() * playlist.length)];
			const albumObject = {artist: extractArtists(randomAlbum[1]), album: randomAlbum[0]};
			if (!randomAlbums.find((album) => album.album === albumObject.album)) {
				randomAlbums.push(albumObject);
			}
		}
		while (randomAlbums.length < 4) {
			randomAlbums.push({artist: "", album: ""});
		}
		return randomAlbums;
	}

	public play(playlist: string) {
		this.mpd.current.clear();
		this.mpd.stored.load(playlist);
		this.mpd.playback.play();
	}

	public add(playlist: string) {
		this.mpd.stored.load(playlist);
	}

	public delete(playlist: string) {
		this.mpd.stored.delete(playlist);
	}

	public rename(playlist: string) {
		const dialogRef = this.renameDialog.open(PlaylistInputComponent, {
			width: "25%",
			data: {
				name: playlist,
				title: "Rename Playlist",
				label: "Enter New Name...",
				action: "Rename",
			},
		});

		dialogRef.afterClosed()
			.subscribe((name) => {
				if (name) {
					this.mpd.stored.rename(playlist, name);
				}
			});
	}
}
