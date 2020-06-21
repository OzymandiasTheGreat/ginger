import { OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, forkJoin } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Song, StoredPlaylist, PlaylistItem } from "mpc-js-web";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { extractArtists } from "@src/app/shared/functions/album-extract";


// tslint:disable:newline-per-chained-call
export class Search implements OnInit, OnDestroy {
	protected ngUnsubscribe: Subject<void>;

	public query: string;
	public artists: string[] = [];
	public albums: Array<{
		title: string,
		artist: string,
		items: Song[],
	}> = [];
	public genres: Array<{
		name: string,
		items: Array<{ title: string, artist: string }>,
	}> = [];
	public stored: Array<{
		name: string,
		items: Array<{ title: string, artist: string }>,
	}> = [];
	public playlists: StoredPlaylist[];

	constructor(
		protected route: ActivatedRoute,
		protected mpc: MpdService,
	) {
		this.ngUnsubscribe = new Subject<void>();
	}

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public ngOnInit() {
		this.route.queryParamMap
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((queryParams) => {
				this.query = (queryParams.get("q") && queryParams.get("q").toLowerCase()) || "";
				this.mpc.db.search([["any", this.query]])
					.pipe(takeUntil(this.ngUnsubscribe))
					.subscribe((songs) => this.sortResults(songs));
				this.mpc.stored.list()
					.pipe(takeUntil(this.ngUnsubscribe))
					.subscribe((playlists: StoredPlaylist[]) => {
						this.playlists = playlists;
						this.stored = playlists.filter((pls) => pls.name.toLowerCase().includes(this.query))
							.map((pls) => ({ name: pls.name, items: [] }));

						const obsrvs = playlists.filter((pls) => pls.name.toLowerCase().includes(this.query))
							.map((pls) => this.mpc.stored.list(pls.name).pipe(takeUntil(this.ngUnsubscribe)));
						forkJoin(obsrvs)
							.pipe(takeUntil(this.ngUnsubscribe))
							.subscribe({
								next: (results) => {
									results.forEach((items: PlaylistItem[], index: number) => {
										items.forEach((item) => this.stored[index].items.push({ title: item.album, artist: item.albumArtist }));
									});
								},
								complete: () => {
									for (const pls of this.stored) {
										while (pls.items.length < 4) {
											pls.items.push({ title: "", artist: "" });
										}
										pls.items = pls.items.slice(0, 4);
									}
								},
							});
					});
			});
		this.mpc.on("changed-stored_playlist")
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe(() => this.mpc.stored.list()
				.pipe(takeUntil(this.ngUnsubscribe))
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
					albums[song.album].items.push(song);
				} else {
					albums[song.album] = { title: song.album, artist: song.albumArtist, items: [song] };
				}
			} else if (
				(song.title && song.title.toLowerCase().includes(this.query))
				|| (song.name && song.name.toLowerCase().includes(this.query))
			) {
				if (song.album in albums) {
					albums[song.album].items.push(song);
				} else {
					albums[song.album] = { title: song.album, artist: song.albumArtist, items: [song] };
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
		this.albums = Object.values(albums);
		this.genres = Object.entries(genres)
			.map(([genre, entries]) => ({ name: genre, items: Object.entries(entries)
				.slice(0, 4).map(([album, items]) => ({ title: album, artist: extractArtists(items) })) }));
		for (const { items } of this.genres) {
			while (items.length < 4) {
				items.push({ title: "", artist: "" });
			}
		}
	}

	public play(tag: string, query: string) {
		this.mpc.current.clear();
		this.mpc.db.searchAdd([[tag, query]])
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe(() => this.mpc.playback.play());
	}

	public add(tag: string, query: string) {
		this.mpc.db.searchAdd([[tag, query]]);
	}

	public playlistPlay(playlist: string) {
		this.mpc.current.clear();
		this.mpc.stored.load(playlist);
		this.mpc.playback.play();
	}

	public playlistAdd(playlist: string) {
		this.mpc.stored.load(playlist);
	}
}
