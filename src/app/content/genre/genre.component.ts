import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Song } from "mpc-js-web";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { SearchService } from "@src/app/shared/services/search.service";
import { filterView } from "@src/app/shared/functions/filter";


@Component({
	selector: "app-genre",
	templateUrl: "./genre.component.html",
	styleUrls: ["./genre.component.scss"]
})
export class GenreComponent implements OnInit {
	public genre: string;
	public songs: Array<[string, Song[]]>;
	public unsorted: Array<[string, Song[]]>;
	public sorted: Array<[string, Song[]]>;

	constructor(
		private route: ActivatedRoute,
		private mpd: MpdService,
		private search: SearchService,
	) {
		this.genre = this.route.snapshot.paramMap.get("genre");
	}

	public ngOnInit() {
		this.mpd.db.search([["Genre", this.genre]])
			.subscribe((songs) => {
				const albums = {};
				for (const song of songs) {
					if (song.album in albums) {
						albums[song.album].push(song);
					} else {
						albums[song.album] = [song];
					}
				}
				this.songs = Object.entries(albums);
				this.unsorted = [...this.songs];
				this.sorted = [...this.songs];

				this.search.query.subscribe((query) => filterView(query, this));
			});
	}
}
