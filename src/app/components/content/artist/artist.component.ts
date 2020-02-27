import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { concatAll } from "rxjs/operators";
import { Song } from "mpc-js-web";

import { MpdService } from "../../../shared/services/mpd.service";
import { SearchService } from "../../../shared/services/search.service";
import { filterView } from "../../../shared/functions/filter";


@Component({
	selector: "app-artist",
	templateUrl: "./artist.component.html",
	styleUrls: ["./artist.component.scss"]
})
export class ArtistComponent implements OnInit {
	public artist: string;
	public songs: Array<[string, Song[]]>;
	public unsorted: Array<[string, Song[]]>;
	public sorted: Array<[string, Song[]]>;

	constructor(
		private route: ActivatedRoute,
		private mpd: MpdService,
		private search: SearchService,
	) {
		this.artist = this.route.snapshot.paramMap.get("artist");
	}

	public ngOnInit() {
		const albums = {};
		this.mpd.db.search([["AlbumArtist", this.artist]])
			.pipe(concatAll())
			.subscribe({
				next: (song) => {
					if (song.album in albums) {
						albums[song.album].push(song);
					} else {
						albums[song.album] = [song];
					}
				},
				complete: () => {
					this.songs = Object.entries(albums);
					this.unsorted = [...this.songs];
					this.sorted = [...this.songs];

					this.search.query.subscribe((query) => filterView(query, this));
				},
			});
	}

}
