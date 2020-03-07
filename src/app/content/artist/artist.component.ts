import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject} from "rxjs";
import { takeUntil, concatAll } from "rxjs/operators";
import { Song } from "mpc-js-web";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { SearchService } from "@src/app/shared/services/search.service";
import { filterView } from "@src/app/shared/functions/filter";


@Component({
	selector: "app-artist",
	templateUrl: "./artist.component.html",
	styleUrls: ["./artist.component.scss"]
})
export class ArtistComponent implements OnInit, OnDestroy {
	private ngUnsubscribe: Subject<void>;
	public artist: string;
	public songs: Array<{
		title: string,
		artist: string,
		items: Song[],
	}>;
	public unsorted: Array<{
		title: string,
		artist: string,
		items: Song[],
	}>;
	public sorted: Array<{
		title: string,
		artist: string,
		items: Song[],
	}>;

	constructor(
		private route: ActivatedRoute,
		private mpd: MpdService,
		private search: SearchService,
	) {
		this.ngUnsubscribe = new Subject<void>();
		this.artist = this.route.snapshot.paramMap.get("artist");
	}

	public ngOnInit() {
		const albums = {};
		this.mpd.db.search([["AlbumArtist", this.artist]])
			.pipe(
				concatAll(),
				takeUntil(this.ngUnsubscribe),
			)
			.subscribe({
				next: (song) => {
					this.groupByAlbum(song, albums);
				},
				complete: () => {
					this.songs = Object.values(albums);
					this.unsorted = [...this.songs];
					this.sorted = [...this.songs];

					this.search.query.pipe(takeUntil(this.ngUnsubscribe))
						.subscribe((query) => filterView(query, this));
				},
			});
	}

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	private groupByAlbum(song: Song, albums: {}) {
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
