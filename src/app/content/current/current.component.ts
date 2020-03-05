import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil, first } from "rxjs/operators";
import { PlaylistItem } from "mpc-js-web";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { extractArtists } from "@src/app/shared/functions/album-extract";
import { SearchService } from "@src/app/shared/services/search.service";
import { filterView } from "@src/app/shared/functions/filter";


@Component({
	selector: "app-current",
	templateUrl: "./current.component.html",
	styleUrls: ["./current.component.scss"],
})
export class CurrentComponent implements OnInit, OnDestroy {
	private ngUnsubscribe: Subject<void>;

	public songs: Array<{
		title: string,
		artist: string,
		items: PlaylistItem[],
	}>;
	public unsorted: Array<{
		title: string,
		artist: string,
		items: PlaylistItem[],
	}>;
	public sorted: Array<{
		title: string,
		artist: string,
		items: PlaylistItem[],
	}>;
	public currentSong: PlaylistItem;

	constructor(
		private mpc: MpdService,
		private search: SearchService,
	) {
		this.ngUnsubscribe = new Subject();
	}

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public ngOnInit() {
		let albums = {};
		this.mpc.current.playlist.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe({
				next: (song) => {
					this.groupByAlbum(song, albums);
				},
				complete: () => {
					this.songs = Object.values(albums);
					this.unsorted = [...this.songs];
					this.sorted = [...this.songs];
					this.search.query.subscribe((query) => filterView(query, this));
				},
			});
		this.mpc.currentSong.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((song) => this.currentSong = song);
		this.mpc.on("changed-player")
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe(() => this.mpc.currentSong.pipe(first())
				.subscribe((song) => this.currentSong = song));
		this.mpc.on("changed-playlist")
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe(() => {
				albums = {};
				this.mpc.current.playlist.pipe(takeUntil(this.ngUnsubscribe))
					.subscribe({
						next: (song) => {
							this.groupByAlbum(song, albums);
						},
						complete: () => {
							this.songs = Object.values(albums);
							this.unsorted = [...this.songs];
							this.sorted = [...this.songs];
						}
					});
			});
	}

	private groupByAlbum(song: PlaylistItem, albums: {}) {
		if (song.album in albums) {
			albums[song.album].items.push(song);
		} else {
			albums[song.album] = {
				title: song.album,
				artist: song.albumArtist,
				items: [song],
			};
		}
	}
}
