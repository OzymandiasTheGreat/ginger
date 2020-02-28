import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { forkJoin } from "rxjs";
import { Song, StoredPlaylist, PlaylistItem } from "mpc-js-web";

import { MpdService } from "../../../shared/services/mpd.service";
import { extractArtists } from "../../../shared/functions/album-extract";
import { PlaylistInputComponent } from "../../../shared/components/playlist-input/playlist-input.component";


// tslint:disable:newline-per-chained-call
@Component({
	selector: "app-search",
	templateUrl: "./search.component.html",
	styleUrls: ["./search.component.scss"]
})
export class SearchComponent implements OnInit {
	public query: string;
	public artists: string[] = [];
	public albums: Array<[string, Song[]]> = [];
	public genres: Array<[string, Array<[string, string]>]> = [];
	public stored: Array<[string, Array<[string, string]>]> = [];
	public playlists: StoredPlaylist[];

	constructor(
		private route: ActivatedRoute,
		private mpd: MpdService,
		private playlistInputDialog: MatDialog,
	) {}

	public ngOnInit(): void {
		this.route.queryParamMap.subscribe((queryParams) => {
			this.query = (queryParams.get("q") && queryParams.get("q").toLowerCase()) || "";
			this.mpd.db.search([["any", this.query]])
				.subscribe((songs) => this.sortResults(songs));
			this.mpd.stored.list()
				.subscribe((playlists: StoredPlaylist[]) => {
					this.playlists = playlists;
					this.stored = playlists.filter((playlist) => playlist.name.toLowerCase().includes(this.query))
						.map((playlist) => [playlist.name, []]);

					const obsrvs = playlists.filter((playlist) => playlist.name.toLowerCase().includes(this.query))
						.map((playlist) => this.mpd.stored.list(playlist.name));
					forkJoin(obsrvs).subscribe({
						next: (results) => {
							results.forEach((items: PlaylistItem[], index: number) => {
								items.forEach((item) => this.stored[index][1].push([item.albumArtist, item.album]));
							});
						},
						complete: () => {
							for (const playlist of this.stored) {
								while (playlist[1].length < 4) {
									playlist[1].push(["", ""]);
								}
								playlist[1] = playlist[1].slice(0, 4);
							}
						},
					});
				});
		});
		this.mpd.stored.list()
			.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists);
		this.mpd.on("changed-stored_playlist")
			.subscribe(() => this.mpd.stored.list()
				.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists));
	}

	public sortResults(songs: Song[]) {
		const artists: string[] = [];
		const albums = {};
		const genres = {};
		songs.forEach((song) => {
			if (song.albumArtist && song.albumArtist.toLowerCase().includes(this.query)) {
				if (!artists.includes(song.albumArtist)) {
					artists.push(song.albumArtist);
				}
			} else if (song.artist && song.artist.toLowerCase().includes(this.query)) {
				if (!artists.includes(song.artist)) {
					artists.push(song.artist);
				}
			} else if (song.album && song.album.toLowerCase().includes(this.query)) {
				if (song.album in albums) {
					albums[song.album].push(song);
				} else {
					albums[song.album] = [song];
				}
			} else if (
				(song.title && song.title.toLowerCase().includes(this.query))
				|| (song.name && song.name.toLowerCase().includes(this.query))
			) {
				if (song.album in albums) {
					albums[song.album].push(song);
				} else {
					albums[song.album] = [song];
				}
			} else if (song.genre && song.genre.toLowerCase().includes(this.query)) {
				if (song.genre in genres) {
					if (song.album in genres[song.genre]) {
						genres[song.genre][song.album].push(song);
					} else {
						genres[song.genre][song.album] = [song];
					}
				} else {
					genres[song.genre] = {};
					genres[song.genre][song.album] = [song];
				}
			}
		});
		this.artists = artists;
		this.albums = Object.entries(albums);
		this.genres = Object.entries(genres)
			.map(([genre, entries]) => [genre, Object.entries(entries)
				.slice(0, 4).map(([album, items]) => [album, extractArtists(items)])]);
		for (const [genre, entries] of this.genres) {
			while (entries.length < 4) {
				entries.push(["", ""]);
			}
		}
	}

	public play(tag: string, query: string) {
		this.mpd.current.clear();
		this.mpd.db.searchAdd([[tag, query]])
			.subscribe(() => this.mpd.playback.play());
	}

	public add(tag: string, query: string) {
		this.mpd.db.searchAdd([[tag, query]]);
	}

	public addPlaylist(tag: string, query: string, playlist: string) {
		this.mpd.db.searchAddPlaylist([[tag, query]], playlist);
	}

	public openNewPlaylistDialog(tag: string, query: string) {
		const dialogRef = this.playlistInputDialog.open(PlaylistInputComponent, {
			width: "25%",
			data: {
				name: "",
				title: "Create New Playlist",
				label: "Enter Name...",
				action: "Create",
			},
		});

		dialogRef.afterClosed()
			.subscribe((name) => {
				if (name) {
					this.mpd.db.searchAddPlaylist([[tag, query]], name);
				}
			});
	}

	public playlistPlay(playlist: string) {
		this.mpd.current.clear();
		this.mpd.stored.load(playlist)
			.subscribe(() => this.mpd.playback.play());
	}

	public playlistAdd(playlist: string) {
		this.mpd.stored.load(playlist);
	}
}
