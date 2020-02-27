import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { map } from "rxjs/operators";
import { StoredPlaylist } from "mpc-js-web";

import { MpdService } from "../../../shared/services/mpd.service";
import { SearchService } from "../../../shared/services/search.service";
import { PlaylistInputComponent } from "../../../shared/components/playlist-input/playlist-input.component";


@Component({
	selector: "app-genres",
	templateUrl: "./genres.component.html",
	styleUrls: ["./genres.component.scss"]
})
export class GenresComponent implements OnInit {
	public genres: Array<[string, Array<[string, string]>]>;
	public sorted: Array<[string, Array<[string, string]>]>;
	public randomAlbums = {};
	public playlists: StoredPlaylist[];

	constructor(
		private dialog: MatDialog,
		private mpd: MpdService,
		private search: SearchService,
	) {}

	public ngOnInit() {
		this.mpd.db.list("Genre", [], ["AlbumArtist", "Album"])
			.pipe(
				map((genres) => {
					const values = [...genres.values()];
					const albums = [...genres.keys()];
					values.push(values.shift());
					const mapped = values.map((genre, index) => [genre[0], albums[index]]);
					const sorted = {};
					mapped.forEach(([genre, album]) => {
						if (genre === undefined || (album[0] === null && album[1] === null) || genre.length < 1) {
							return;
						}
						if ((genre as string) in sorted) {
							sorted[genre as string].push(album);
						} else {
							sorted[genre as string] = [album];
						}
					});
					return <Array<[string, Array<[string, string]>]>> Object.entries(sorted)
						.sort(([a, aAlbums], [b, bAlbums]) => a.localeCompare(b));
				}),
			)
			.subscribe({
				next: (genres) => this.genres = genres,
				complete: () => {
					for (const [genre, albums] of this.genres) {
						this.randomAlbums[genre] = this.getRandomAlbums(albums);
					}
					this.sorted = [...this.genres];

					this.search.query.subscribe((query) => {
						query = query.toLowerCase();
						this.genres = query.length > 0
							// tslint:disable-next-line:newline-per-chained-call
							? this.sorted.filter(([genre, albums]) => genre?.toLowerCase().includes(query))
							: [...this.sorted];
					});
				},
			});
		this.mpd.stored.list()
			.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists);
	}

	public getRandomAlbums(albums: Array<[string, string]>): Array<[string, string]> {
		const randomAlbums: Array<[string, string]> = [];
		for (let i = 0; randomAlbums.length < 4 && i < 12; i++) {
			const randomAlbum = albums[Math.floor(Math.random() * albums.length)];
			if (!randomAlbums.includes(randomAlbum)) {
				randomAlbums.push(randomAlbum);
			}
		}
		while (randomAlbums.length < 4) {
			randomAlbums.push(["", ""]);
		}
		return randomAlbums;
	}

	public play(genre: string) {
		this.mpd.current.clear()
		this.mpd.db.searchAdd([["Genre", genre]]);
		this.mpd.playback.play();
	}

	public add(genre: string) {
		this.mpd.db.searchAdd([["Genre", genre]]);
	}

	public openPlaylistInputDialog(genre: string) {
		const dialogRef = this.dialog.open(PlaylistInputComponent, {
			width: "25%",
			data: {
				name: "",
				title: "Create New Playlist",
				label: "Enter Name",
				action: "Create",
			},
		});

		dialogRef.afterClosed()
			.subscribe((name) => {
				if (name) {
					this.mpd.db.searchAddPlaylist([["Genre", genre]], name);
				}
			});
	}

	public addPlaylist(playlist: string, genre: string) {
		this.mpd.db.searchAddPlaylist([["Genre", genre]], playlist);
	}
}
