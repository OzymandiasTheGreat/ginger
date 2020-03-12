import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { first, takeUntil } from "rxjs/operators";
import { PlaylistItem } from "mpc-js-web";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { SearchService } from "@src/app/shared/services/search.service";
import { filterView } from "@src/app/shared/functions/filter";


@Component({
	selector: "app-playlist",
	templateUrl: "./playlist.component.html",
	styleUrls: ["./playlist.component.scss"]
})
export class PlaylistComponent implements OnInit, OnDestroy {
	private ngUnsubscribe: Subject<void>;

	public playlist: string;
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

	constructor(
		private route: ActivatedRoute,
		private mpd: MpdService,
		private search: SearchService,
	) {
		this.ngUnsubscribe = new Subject<void>();
		this.playlist = this.route.snapshot.paramMap.get("playlist");
	}

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public ngOnInit() {
		this.mpd.stored.list(this.playlist)
			.pipe(first())
			.subscribe({
				next: (songs: PlaylistItem[]) => {
					this.songs = this.groupByAlbum(songs);
					this.unsorted = [...this.songs];
					this.sorted = [...this.songs];

					this.search.query
						.pipe(takeUntil(this.ngUnsubscribe))
						.subscribe((query) => filterView(query, this));
				},
			});
		this.mpd.on("changed-stored_playlist")
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe(() => {
				this.mpd.stored.list(this.playlist)
					.pipe(first())
					.subscribe({
						next: (songs: PlaylistItem[]) => {
							this.songs = this.groupByAlbum(songs);
							this.unsorted = [...this.songs];
						},
					});
			});
	}

	private groupByAlbum(songs: PlaylistItem[]): Array<{ title: string, artist: string, items: PlaylistItem[] }> {
		const albums = {};
		for (const song of songs) {
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
		return Object.values(albums);
	}
}
