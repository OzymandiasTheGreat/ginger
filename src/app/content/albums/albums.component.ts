import { Component, OnInit } from "@angular/core";
import { concat } from "rxjs";
import { map } from "rxjs/operators";
import { Song } from "mpc-js-web";

import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { SearchService } from "@src/app/shared/services/search.service";
import { filterView } from "@src/app/shared/functions/filter";
import { extractArtists } from "@src/app/shared/functions/album-extract";


@Component({
	selector: "app-albums",
	templateUrl: "./albums.component.html",
	styleUrls: ["./albums.component.scss"]
})
export class AlbumsComponent implements OnInit {
	public songs: Array<{
		title: string,
		artist: string,
		items: Song[],
	}> = [];
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
		private mpc: MPClientService,
		private search: SearchService,
	) {}

	public ngOnInit() {
		if (this.mpc.mopidy) {
			this.mpc.db.list("Album")
				.subscribe((res) => {
					// tslint:disable-next-line:newline-per-chained-call
					const albums = res.values().next().value;
					const sorted = [];
					const obsvrs = [];
					for (const album of albums) {
						obsvrs.push(this.mpc.db.search([["Album", album]], null, null, true)
							.pipe(map((songs) => sorted.push({
								title: album,
								artist: extractArtists(songs),
								items: songs,
							}))));
					}
					concat(...obsvrs)
						.subscribe({
							complete: () => {
								this.songs = sorted;
								this.unsorted = [...this.songs];
								this.sorted = [...this.songs];

								this.search.query.subscribe((query) => filterView(query, this));
							},
						});
				});
		} else {
			this.mpc.db.list("AlbumArtist", [], ["Album"])
				.pipe(
					map((entries) => {
						const albums = [...entries.keys()];
						const artists = [...entries.values()];
						artists.push(artists.shift());
						return albums.map((album, index) => [album, artists[index]].flat());
					})
				)
				.subscribe((albums) => {
					const sorted = [];
					const obsvrs = [];
					albums.forEach(([album, artist]) => {
						obsvrs.push(this.mpc.db.search([["AlbumArtist", artist], ["Album", album]])
							.pipe(
								map((songs) => sorted.push({
									title: album,
									artist,
									items: songs,
								})),
							)
						);
					});
					concat(...obsvrs)
						.subscribe({
							complete: () => {
								this.songs = sorted;
								this.unsorted = [...this.songs];
								this.sorted = [...this.songs];

								this.search.query.subscribe((query) => filterView(query, this));
							},
						});
				});
		}
	}
}
