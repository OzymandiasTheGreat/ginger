import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { MatAccordion } from "@angular/material/expansion";
import { MatDialog } from "@angular/material/dialog";
import { PlaylistItem, Song, StoredPlaylist } from "mpc-js-web";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { extractArtists, extractYear } from "@src/app/shared/functions/album-extract";
import { PlaylistInputComponent } from "@src/app/shared/components/playlist-input/playlist-input.component";


@Component({
	selector: "app-album-list",
	templateUrl: "./album-list.component.html",
	styleUrls: ["./album-list.component.scss"]
})
export class AlbumListComponent implements OnInit {
	@Input() public queue = false ;
	@Input() public playlist = false;
	@Input() public artist = false;
	@Input() public albums = false;
	@Input() public genres = false;
	@Input() public search = false;
	@Input() public songs: Array<[ string, PlaylistItem[] | Song[] ]>;
	@Input() public unsorted: Array<[ string, PlaylistItem[] | Song[] ]>;
	@Input() public currentSong: PlaylistItem;
	@Input() public currentPlaylist: string;
	@Input() public albumArtist: string;
	@Input() public currentGenre: string;

	public extractArtists = extractArtists;
	public extractYear = extractYear;
	public playlistSort: {
		none(a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]): number,
		artistAsc(a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]): number,
		artistDesc(a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]): number,
		albumAsc(a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]): number,
		albumDesc(a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]): number,
		yearAsc(a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]): number,
		yearDesc(a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]): number,
	};
	public playlists: StoredPlaylist[];

	@ViewChild("scrollViewPort", { static: true }) public scrollViewPort: CdkVirtualScrollViewport;
	@ViewChild("accordion", { static: true }) public accordion: MatAccordion;

	constructor(
		public playlistInputDialog: MatDialog,
		private router: Router,
		private mpd: MpdService,
	) {
		this.playlistSort = {
			none: (a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]): number => {
				const aIndex = this.unsorted.indexOf(a);
				const bIndex = this.unsorted.indexOf(b);
				return aIndex < bIndex ? -1 : aIndex > bIndex ? 1 : 0;
			},
			artistAsc: (a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]): number => {
				const aArtist = this.extractArtists(a[1])
					.toLocaleLowerCase();
				const bArtist = this.extractArtists(b[1])
					.toLocaleLowerCase();
				const aAlbum = a[0].toLocaleLowerCase();
				const bAlbum = b[0].toLocaleLowerCase();
				if (aArtist < bArtist) {
					return -1;
				}
				if (aArtist > bArtist) {
					return 1;
				}
				if (aAlbum < bAlbum) {
					return -1;
				}
				if (aAlbum > bAlbum) {
					return 1;
				}
				return 0;
			},
			artistDesc: (a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]): number => {
				const aArtist = this.extractArtists(a[1])
					.toLocaleLowerCase();
				const bArtist = this.extractArtists(b[1])
					.toLocaleLowerCase();
				const aAlbum = a[0].toLocaleLowerCase();
				const bAlbum = b[0].toLocaleLowerCase();
				if (aArtist > bArtist) {
					return -1;
				}
				if (aArtist < bArtist) {
					return 1;
				}
				if (aAlbum > bAlbum) {
					return -1;
				}
				if (aAlbum < bAlbum) {
					return 1;
				}
				return 0;
			},
			albumAsc: (a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]): number => {
				const aAlbum = a[0].toLocaleLowerCase();
				const bAlbum = b[0].toLocaleLowerCase();
				return aAlbum < bAlbum ? -1 : aAlbum > bAlbum ? 1 : 0;
			},
			albumDesc: (a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]): number => {
				const aAlbum = a[0].toLocaleLowerCase();
				const bAlbum = b[0].toLocaleLowerCase();
				return aAlbum > bAlbum ? -1 : aAlbum < bAlbum ? 1 : 0;
			},
			yearAsc: (a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]): number => {
				const aDate = this.extractYear(a[1])
					.getTime();
				const bDate = this.extractYear(b[1])
					.getTime();
				return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
			},
			yearDesc: (a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]): number => {
				const aDate = this.extractYear(a[1])
					.getTime();
				const bDate = this.extractYear(b[1])
					.getTime();
				return aDate > bDate ? -1 : aDate < bDate ? 1 : 0;
			},
		};
	}

	public ngOnInit() {
		this.mpd.stored.list()
			.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists);
	}

	public playAll() {
		const tag = this.artist ? "AlbumArtist" : this.genres ? "Genre" : undefined;
		const query = this.artist ? this.albumArtist : this.genres ? this.currentGenre : undefined;
		this.mpd.current.clear();
		if (this.artist || this.genres) {
			this.mpd.db.searchAdd([[tag, query]]);
		} else if (this.albums) {
			this.mpd.current.add("/", false);
		} else {
			this.mpd.stored.load(this.currentPlaylist);
		}
		this.mpd.playback.play();
	}

	public addAll() {
		const tag = this.artist ? "AlbumArtist" : this.genres ? "Genre" : undefined;
		const query = this.artist ? this.albumArtist : this.genres ? this.currentGenre : undefined;
		if (this.artist || this.genres) {
			this.mpd.db.searchAdd([[tag, query]]);
		} else if (this.albums) {
			this.mpd.current.add("/", false);
		} else {
			this.mpd.stored.load(this.currentPlaylist);
		}
	}

	public openPlaylistInputDialog(songs?: Array<PlaylistItem | Song>): void {
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
					if (!songs) {
						const tag = this.artist ? "AlbumArtist" : this.genres ? "Genre" : undefined;
						const query = this.artist ? this.albumArtist : this.genres ? this.currentGenre : undefined;
						if (this.artist || this.genres) {
							this.mpd.db.searchAddPlaylist([[tag, query]], name);
						} else if (this.albums) {
							this.mpd.stored.add(name, "/");
						} else {
							this.mpd.stored.save(name);
						}
					} else {
						for (const song of songs) {
							this.mpd.stored.add(name, song.path);
						}
					}
					this.mpd.stored.list()
						.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists);
				}
			});
	}

	public addPlaylist(playlist: string, songs?: Array<PlaylistItem | Song>) {
		if (songs) {
			for (const song of songs) {
				this.mpd.stored.add(playlist, song.path);
			}
		} else {
			const tag = this.artist ? "AlbumArtist" : this.genres ? "Genre" : undefined;
			const query = this.artist ? this.albumArtist : this.genres ? this.currentGenre : undefined;
			if (this.artist || this.genres) {
				this.mpd.db.searchAddPlaylist([[tag, query]], playlist);
			} else if (this.albums) {
				this.mpd.stored.add(playlist, "/");
			} else {
				for (const [album, items] of this.songs) {
					for (const song of items) {
						this.mpd.stored.add(playlist, song.path);
					}
				}
			}
		}
	}

	public deletePlaylist() {
		if (this.playlist) {
			this.mpd.stored.delete(this.currentPlaylist);
		}
		this.router.navigate(["../"], { relativeTo: this.router.routerState.root });
	}

	public playAlbum(album: string, artist: string, event: Event) {
		event.stopPropagation();
		this.mpd.current.clear();
		this.mpd.db.searchAdd([["AlbumArtist", artist], ["Album", album]]);
		this.mpd.playback.play();
	}

	public removeAlbum(name: string, event: Event) {
		event.stopPropagation();
		const songs = this.songs.find((album) => album[0] === name)[1];
		if (this.queue) {
			for (const song of songs) {
				this.mpd.current.remove((song as PlaylistItem).id);
			}
		} else {
			this.mpd.stored.list(this.currentPlaylist)
				.subscribe((info) => {
					let margin = 0;
					for (const song of songs) {
						const position = info.findIndex((item) => item.title === song.title && item.album === song.album && item.artist === song.artist);
						this.mpd.stored.remove(this.currentPlaylist, position - margin);
						margin++;
					}
				});
		}
	}

	public addAlbum(album: string, artist: string, event?: Event) {
		if (event) {
			event.stopPropagation();
		}
		this.mpd.db.searchAdd([["AlbumArtist", artist], ["Album", album]]);
	}

	public playSong(song: number | string) {
		if (this.queue && typeof song === "number") {
			this.mpd.playback.play(song);
		} else {
			this.mpd.current.add(<string> song)
				.subscribe((id: number) => this.mpd.playback.play(id));
		}
	}

	public removeSong(song: number | string) {
		if (this.queue && typeof song === "number") {
			this.mpd.current.remove(song);
		} else {
			this.mpd.stored.list(this.currentPlaylist)
				.subscribe((info) => {
					const position = info.findIndex((item) => item.path === song);
					this.mpd.stored.remove(this.currentPlaylist, position);
				});
		}
	}

	public addSong(song: string) {
		this.mpd.current.add(song);
	}

	public scrollCurrent() {
		const index = this.songs.findIndex((album) => album[1].some((song) => song.id === this.currentSong.id));
		this.scrollViewPort.scrollToIndex(index);
		this.accordion.openAll();
	}

	public sortView(comparator: (a: [ string, PlaylistItem[] ], b: [ string, PlaylistItem[] ]) => number) {
		this.songs = [...this.songs.sort(comparator)];
	}

	public clearPlaylist() {
		if (this.queue) {
			this.mpd.current.clear();
		} else if (this.playlist) {
			this.mpd.stored.clear(this.currentPlaylist);
		}
	}
}
