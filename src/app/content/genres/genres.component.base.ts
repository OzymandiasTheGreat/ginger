import { OnInit, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil, map } from "rxjs/operators";
import { StoredPlaylist } from "mpc-js-web";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { SearchService } from "@src/app/shared/services/search.service";


export class Genres implements OnInit, OnDestroy {
	protected ngUnsubscribe: Subject<void>;
	public genres: Array<{ name: string, items: Array<{ title: string, artist: string }> }> = [];
	public sorted: Array<{ name: string, items: Array<{ title: string, artist: string }> }>;
	public randomAlbums = {};
	public playlists: StoredPlaylist[];

	constructor(
		protected mpc: MpdService,
		protected search: SearchService,
	) {
		this.ngUnsubscribe = new Subject<void>();
	}

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public ngOnInit() {
		this.mpc.db.list("Genre", [], ["AlbumArtist", "Album"])
			.pipe(
				map((genres) => {
					const values = [...genres.values()];
					const albums = [...genres.keys()];
					values.push(values.shift());
					const mapped = values.map((genre, index) => [genre[0], albums[index]]);
					const sorted = {};
					mapped.forEach(([genre, album]) => {
						if (genre === undefined || (album[0] === null && album[1] === null) || genre.length < 1) {
							return;
						}
						if ((genre as string) in sorted) {
							sorted[genre as string].push({ title: album[1], artist: album[0] });
						} else {
							sorted[genre as string] = [{ title: album[1], artist: album[0] }];
						}
					});
					return <Array<{ name: string, items: Array<{ title: string, artist: string }>}>> Object.entries(sorted)
						.sort(([a, aAlbums], [b, bAlbums]) => a.localeCompare(b))
						.map(([name, items]) => ({ name, items }));
				}),
				takeUntil(this.ngUnsubscribe),
			)
			.subscribe({
				next: (genres) => this.genres = genres,
				complete: () => {
					for (const { name, items } of this.genres) {
						this.randomAlbums[name] = this.getRandomAlbums(items);
					}
					this.sorted = [...this.genres];

					this.search.query.pipe(takeUntil(this.ngUnsubscribe))
						.subscribe((query) => {
							query = query.toLowerCase();
							this.genres = query.length > 0
								// tslint:disable-next-line:newline-per-chained-call
								? this.sorted.filter(({ name, items}) => name && name.toLowerCase().includes(query))
								: [...this.sorted];
						});
				},
			});
		this.mpc.stored.list()
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists);
	}

	public getRandomAlbums(albums: Array<{ title: string, artist: string }>): Array<{ title: string, artist: string }> {
		const randomAlbums: Array<{ title: string, artist: string }> = [];
		for (let i = 0; randomAlbums.length < 4 && i < 12; i++) {
			const randomAlbum = albums[Math.floor(Math.random() * albums.length)];
			if (!randomAlbums.includes(randomAlbum)) {
				randomAlbums.push(randomAlbum);
			}
		}
		while (randomAlbums.length < 4) {
			randomAlbums.push({ title: "", artist: "" });
		}
		return randomAlbums;
	}

	public add(genre: string) {
		this.mpc.db.searchAdd([["Genre", genre]]);
	}

	public play(genre: string) {
		this.mpc.current.clear();
		this.add(genre);
		this.mpc.playback.play();
	}

	public addPlaylist(playlist: string, genre: string) {
		this.mpc.db.searchAddPlaylist([["Genre", genre]], playlist);
	}
}
