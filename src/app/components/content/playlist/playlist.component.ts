import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PlaylistItem } from "mpc-js-web";

import { MpdService } from "../../../shared/services/mpd.service";
import { SearchService } from "../../../shared/services/search.service";
import { filterView } from "../../../shared/functions/filter";


@Component({
	selector: "app-playlist",
	templateUrl: "./playlist.component.html",
	styleUrls: ["./playlist.component.scss"]
})
export class PlaylistComponent implements OnInit {
	public playlist: string;
	public songs: Array<[string, PlaylistItem[]]>;
	public unsorted: Array<[string, PlaylistItem[]]>;
	public sorted: Array<[string, PlaylistItem[]]>;

	constructor(
		private route: ActivatedRoute,
		private mpd: MpdService,
		private search: SearchService,
	) {
		this.playlist = this.route.snapshot.paramMap.get("playlist");
	}

	public ngOnInit() {
		this.mpd.stored.list(this.playlist)
			.subscribe({
				next: (songs: PlaylistItem[]) => {
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
				},
			});
		this.mpd.on("changed-stored_playlist")
			.subscribe(() => {
				this.mpd.stored.list(this.playlist)
					.subscribe({
						next: (songs: PlaylistItem[]) => {
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
						},
					});
			});
	}
}
