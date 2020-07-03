import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { concatAll, takeUntil } from "rxjs/operators";
import { Song } from "mpc-js-web";

import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { SearchService } from "@src/app/shared/services/search.service";
import { filterView } from "@src/app/shared/functions/filter";


@Component({
	selector: "app-genre",
	templateUrl: "./genre.component.html",
	styleUrls: ["./genre.component.scss"]
})
export class GenreComponent implements OnInit, OnDestroy {
	private ngUnsubscribe: Subject<void>;

	public genre: string;
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
		private mpc: MPClientService,
		private search: SearchService,
	) {
		this.ngUnsubscribe = new Subject<void>();
		this.genre = this.route.snapshot.paramMap.get("genre");
	}

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public ngOnInit() {
		const albums = {};
		this.mpc.db.search([["Genre", this.genre]])
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

					this.search.query
						.pipe(takeUntil(this.ngUnsubscribe))
						.subscribe((query) => filterView(query, this));
				},
			});
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
