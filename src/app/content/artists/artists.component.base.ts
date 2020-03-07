import { OnInit, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil, first, map, concatAll } from "rxjs/operators";
import { StoredPlaylist } from "mpc-js-web";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { SearchService } from "@src/app/shared/services/search.service";


export class Artists implements OnInit, OnDestroy {
	protected ngUnsubscribe: Subject<void>;
	public artists: string[];
	public sorted: string[];
	public playlists: StoredPlaylist[];

	constructor(
		private mpc: MpdService,
		private search: SearchService,
	) {
		this.ngUnsubscribe = new Subject<void>();
	}

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public ngOnInit() {
		this.mpc.db.list("AlbumArtist")
			.pipe(
				map((artists) => artists.values()),
				concatAll(),
				first(),
			)
			.subscribe((artists) => {
				const artistsNormalized = artists.map((artist) => artist.toLowerCase());
				this.artists = artists.filter((artist, index) => {
					return artistsNormalized.indexOf(artist.toLowerCase()) === index;
				});
				this.sorted = [...this.artists];
				this.search.query.subscribe((query) => {
					query = query.toLowerCase();
					this.artists = query.length > 0
						// tslint:disable-next-line:newline-per-chained-call
						? this.sorted.filter((artist) => artist && artist.toLowerCase().includes(query))
						: this.artists = [...this.sorted];
				});
			});
		this.mpc.stored.list()
			.pipe(first())
			.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists);
		this.mpc.on("changed-stored_playlist")
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe(() => this.mpc.stored.list()
				.pipe(first())
				.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists));
	}

	public playArtist(artist: string) {
		this.mpc.current.clear();
		this.addQueue(artist);
		this.mpc.playback.play();
	}

	public addQueue(artist: string) {
		this.mpc.db.searchAdd([["AlbumArtist", artist]]);
	}

	public addPlaylist(artist: string, playlist: string) {
		this.mpc.db.searchAddPlaylist([["AlbumArtist", artist]], playlist);
	}
}
