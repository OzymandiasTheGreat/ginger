import { Component, OnInit } from "@angular/core";
import { PlaylistItem } from "mpc-js-web";

import { MpdService } from "../../../shared/services/mpd.service";
import { SearchService } from "../../../shared/services/search.service";
import { filterView } from "../../../shared/functions/filter";


@Component({
	selector: "app-current",
	templateUrl: "./current.component.html",
	styleUrls: ["./current.component.scss"]
})
export class CurrentComponent implements OnInit {
	public songs: Array<[ string, PlaylistItem[] ]>;
	public currentSong: PlaylistItem;
	public unsorted: Array<[ string, PlaylistItem[] ]>;
	public sorted: Array<[string, PlaylistItem[]]>;

	constructor(
		private mpd: MpdService,
		private search: SearchService,
	) {}

	public ngOnInit() {
		let albums = {};
		this.mpd.current.playlist.subscribe({
			next: (song) => {
				if (song.album in albums) {
					albums[song.album].push(song);
				} else {
					albums[song.album] = [song];
				}
				this.songs = Object.entries(albums);
			},
			complete: () => {
				this.unsorted = [...this.songs];
				this.sorted = [...this.songs];

				this.search.query.subscribe((query) => filterView(query, this));
			},
		});
		this.mpd.currentSong.subscribe((song) => {
			this.currentSong = song;
		});
		this.mpd.on("changed-player")
			.subscribe(() => {
				this.mpd.currentSong.subscribe((song) => {
					this.currentSong = song;
				});
			});
		this.mpd.on("changed-playlist")
			.subscribe(() => {
				albums = {};
				this.mpd.current.playlist.subscribe({
					next: (song) => {
						if (song.album in albums) {
							albums[song.album].push(song);
						} else {
							albums[song.album] = [song];
						}
					},
					complete: () => {
						this.songs = (Object.entries(albums) || []) as Array<[string, PlaylistItem[]]>;
					}
				});
			});
	}
}
