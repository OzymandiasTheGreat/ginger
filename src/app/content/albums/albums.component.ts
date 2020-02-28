import { Component, OnInit } from "@angular/core";
import { concat } from "rxjs";
import { map } from "rxjs/operators";
import { Song } from "mpc-js-web";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { SearchService } from "@src/app/shared/services/search.service";
import { filterView } from "@src/app/shared/functions/filter";


@Component({
	selector: "app-albums",
	templateUrl: "./albums.component.html",
	styleUrls: ["./albums.component.scss"]
})
export class AlbumsComponent implements OnInit {
	public songs: Array<[string, Song[]]> = [];
	public unsorted: Array<[string, Song[]]>;
	public sorted: Array<[string, Song[]]>;

	constructor(
		private mpd: MpdService,
		private search: SearchService,
	) {}

	public ngOnInit() {
		this.mpd.db.list("AlbumArtist", [], ["Album"])
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
					obsvrs.push(this.mpd.db.search([["AlbumArtist", artist], ["Album", album]])
						.pipe(
							map((songs) => sorted.push([album, songs]))
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
