import { OnInit, Input } from "@angular/core";
import { first } from "rxjs/operators";
import { PlaylistItem, Song, StoredPlaylist } from "mpc-js-web";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { extractYear } from "@src/app/shared/functions/album-extract";


export class AlbumList implements OnInit {
	@Input() public queue    = false;
	@Input() public playlist = false;
	@Input() public artist   = false;
	@Input() public albums   = false;
	@Input() public genres   = false;
	@Input() public search   = false;
	@Input() public songs: Array<{
		title: string,
		artist: string,
		items: Array<(PlaylistItem | Song)>,
	}>;
	@Input() public unsorted: Array<{
		title: string,
		artist: string,
		items: Array<(PlaylistItem | Song)>,
	}>;
	@Input() public currentSong: PlaylistItem;
	@Input() public currentPlaylist: string;
	@Input() public albumArtist: string;
	@Input() public currentGenre: string;
	public playlistSort: {
		none(
			a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
		): number,
		artistAsc(
			a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
		): number,
		artistDesc(
			a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
		): number,
		albumAsc(
			a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
		): number,
		albumDesc(
			a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
		): number,
		yearAsc(
			a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
		): number,
		yearDesc(
			a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
		): number,
	};
	public playlists: StoredPlaylist[];

	constructor(
		private router: any,
		private mpc: MpdService,
	) {
		this.playlistSort = {
			none: (
				a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
				b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			): number => {
				const aIndex = this.unsorted.indexOf(a);
				const bIndex = this.unsorted.indexOf(b);
				return aIndex < bIndex ? -1 : aIndex > bIndex ? 1 : 0;
			},
			artistAsc: (
				a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
				b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			): number => {
				const aArtist = a.artist.toLocaleLowerCase();
				const bArtist = b.artist.toLocaleLowerCase();
				const aAlbum = a.title.toLocaleLowerCase();
				const bAlbum = b.title.toLocaleLowerCase();
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
			artistDesc: (
				a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
				b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			): number => {
				const aArtist = a.artist.toLocaleLowerCase();
				const bArtist = b.artist.toLocaleLowerCase();
				const aAlbum = a.title.toLocaleLowerCase();
				const bAlbum = b.title.toLocaleLowerCase();
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
			albumAsc: (
				a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
				b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			): number => {
				const aAlbum = a.title.toLocaleLowerCase();
				const bAlbum = b.title.toLocaleLowerCase();
				return aAlbum < bAlbum ? -1 : aAlbum > bAlbum ? 1 : 0;
			},
			albumDesc: (
				a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
				b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			): number => {
				const aAlbum = a.title.toLocaleLowerCase();
				const bAlbum = b.title.toLocaleLowerCase();
				return aAlbum > bAlbum ? -1 : aAlbum < bAlbum ? 1 : 0;
			},
			yearAsc: (
				a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
				b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			): number => {
				const aDate = extractYear(a.items)
					.getTime();
				const bDate = extractYear(b.items)
					.getTime();
				return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
			},
			yearDesc: (
				a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
				b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			): number => {
				const aDate = extractYear(a.items)
					.getTime();
				const bDate = extractYear(b.items)
					.getTime();
				return aDate > bDate ? -1 : aDate < bDate ? 1 : 0;
			},
		};
	}

	public ngOnInit() {
		this.mpc.stored.list()
			.pipe(first())
			.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists);
	}

	public addAll() {
		const tag = this.artist ? "AlbumArtist" : this.genres ? "Genre" : undefined;
		const query = this.artist ? this.albumArtist : this.genres ? this.currentGenre : undefined;
		if (this.artist || this.genres) {
			this.mpc.db.searchAdd([[tag, query]]);
		} else if (this.albums) {
			this.mpc.current.add("/", false);
		} else {
			this.mpc.stored.load(this.currentPlaylist);
		}
	}

	public playAll() {
		this.mpc.current.clear();
		this.addAll();
		this.mpc.playback.play();
	}

	public addPlaylist(name: string, songs?: Array<PlaylistItem | Song>) {
		if (songs) {
			songs.forEach((song) => this.mpc.stored.add(name, song.path));
		} else {
			const tag = this.artist ? "AlbumArtist" : this.genres ? "Genre" : undefined;
			const query = this.artist ? this.albumArtist : this.genres ? this.currentGenre : undefined;
			if (this.artist || this.genres) {
				this.mpc.db.searchAddPlaylist([[tag, query]], name);
			} else if (this.albums) {
				this.mpc.stored.add(name, "/");
			} else {
				this.songs.forEach((album) => album.items.forEach((song) => this.mpc.stored.add(name, song.path)));
			}
		}
	}

	public deletePlaylist() {
		if (this.playlist) {
			this.mpc.stored.delete(this.currentPlaylist);
		}
		this.router.navigate(["../"], { relativeTo: this.router.routerState.root });
	}

	public addAlbum(album: string, artist: string) {
		this.mpc.db.searchAdd([["AlbumArtist", artist], ["Album", album]]);
	}

	public playAlbum(album: string, artist: string) {
		this.mpc.current.clear();
		this.addAlbum(album, artist);
		this.mpc.playback.play();
	}

	public removeAlbum(title: string) {
		const songs = this.songs.find((album) => album.title === title).items;
		if (this.queue) {
			songs.forEach((song) => this.mpc.current.remove((<PlaylistItem> song).id));
		} else {
			this.mpc.stored.list(this.currentPlaylist)
				.pipe(first())
				.subscribe((info) => {
					let margin = 0;
					songs.forEach((song) => {
						const pos = info.findIndex((item) => item.title === song.title && item.album === song.album && item.artist === song.artist);
						this.mpc.stored.remove(this.currentPlaylist, pos - margin);
						margin++;
					});
				});
		}
	}

	public addSong(path: string) {
		this.mpc.current.add(path);
	}

	public playSong(song: number | string) {
		if (this.queue && typeof song === "number") {
			this.mpc.playback.play(song);
		} else {
			this.mpc.current.add(<string> song)
				.pipe(first())
				.subscribe((id: number) => this.mpc.playback.play(id));
		}
	}

	public removeSong(song: number | string) {
		if (this.queue && typeof song === "number") {
			this.mpc.current.remove(song);
		} else {
			this.mpc.stored.list(this.currentPlaylist)
				.pipe(first())
				.subscribe((info) => {
					const pos = info.findIndex((item) => item.path === song);
					this.mpc.stored.remove(this.currentPlaylist, pos);
				});
		}
	}

	public sortView(
		comparator: (
			a: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
			b: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
		) => number
	) {
		this.songs = [...this.songs.sort(comparator)];
	}

	public clearPlaylist() {
		if (this.queue) {
			this.mpc.current.clear();
		} else if (this.playlist) {
			this.mpc.stored.clear(this.currentPlaylist);
		}
	}
}
