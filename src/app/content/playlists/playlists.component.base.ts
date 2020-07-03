import { OnInit, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil, first } from "rxjs/operators";
import { StoredPlaylist, PlaylistItem } from "mpc-js-web";

import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { SearchService } from "@src/app/shared/services/search.service";


export class Playlists implements OnInit, OnDestroy {
	public playlists: Array<{ name: string, items: Array<{ title: string, artist: string, items: PlaylistItem[] }> }> = [];
	public sorted: Array<{ name: string, items: Array<{ title: string, artist: string, items: PlaylistItem[] }> }>;
	public randomAlbums = {};

	protected ngUnsubscribe: Subject<void>;

	constructor(
		protected mpc: MPClientService,
		protected search: SearchService,
	) {
		this.ngUnsubscribe = new Subject<void>();
	}

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public ngOnInit() {
		this.mpc.stored.list()
			.pipe(first())
			.subscribe({
				next: (playlists: StoredPlaylist[]) => {
					for (const playlist of playlists) {
						this.mpc.stored.list(playlist.name)
							.pipe(first())
							.subscribe({
								next: (songs: PlaylistItem[]) => {
									this.playlists.push({ name: playlist.name, items: this.groupByAlbum(songs) });
								},
								complete: () => {
									for (const { name, items } of this.playlists) {
										this.randomAlbums[name] = this.getRandomAlbums(items);
									}
									this.sorted = [...this.playlists];

									this.search.query
										.pipe(takeUntil(this.ngUnsubscribe))
										.subscribe((query) => {
											this.playlists = query.length > 0
												// tslint:disable-next-line:newline-per-chained-call
												? this.sorted.filter(({ name, items}) => name && name.toLowerCase().includes(query))
												: [...this.sorted];
										});
								}
							});
					}
				}
			});
		this.mpc.on("changed-stored_playlist")
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe(() => {
				const newPlaylists: Array<{ name: string, items: Array<{ title: string, artist: string, items: PlaylistItem[] }> }> = [];
				this.mpc.stored.list()
					.pipe(first())
					.subscribe({
						next: (playlists: StoredPlaylist[]) => {
							for (const playlist of playlists) {
								this.mpc.stored.list(playlist.name)
									.pipe(first())
									.subscribe({
										next: (songs: PlaylistItem[]) => {
											newPlaylists.push({ name: playlist.name, items: this.groupByAlbum(songs) });
										},
										complete: () => {
											this.playlists = newPlaylists;
											for (const { name, items } of this.playlists) {
												this.randomAlbums[name] = this.getRandomAlbums(items);
											}
										}
									});
							}
						}
					});
			});
	}

	public add(name: string) {
		this.mpc.stored.load(name);
	}

	public play(name: string) {
		this.mpc.current.clear();
		this.add(name);
		this.mpc.playback.play();
	}

	public delete(name: string) {
		this.mpc.stored.delete(name);
	}

	public rename(name: string, newName: string) {
		this.mpc.stored.rename(name, newName);
	}

	protected groupByAlbum(songs: PlaylistItem[]): Array<{ title: string, artist: string, items: PlaylistItem[] }> {
		const albums = {};
		for (const song of songs) {
			if (song.album in albums) {
				albums[song.album].items.push(song);
			} else {
				albums[song.album] = { title: song.album, artist: song.albumArtist, items: [song] };
			}
		}
		return Object.values(albums);
	}

	protected getRandomAlbums(
		playlist: Array<{ title: string, artist: string, items: PlaylistItem[] }>
	): Array<{ artist: string, title: string }> {
		const randomAlbums: Array<{ artist: string, title: string }> = [];
		for (let i = 0; randomAlbums.length < 4 && i < 12; i++) {
			const randomAlbum = playlist[Math.floor(Math.random() * playlist.length)];
			const albumObject = { artist: randomAlbum.artist, title: randomAlbum.title };
			if (!randomAlbums.find((album) => album.title === albumObject.title && album.artist === albumObject.artist)) {
				randomAlbums.push(albumObject);
			}
		}
		while (randomAlbums.length < 4) {
			randomAlbums.push({ artist: "", title: "" });
		}
		return randomAlbums;
	}
}
