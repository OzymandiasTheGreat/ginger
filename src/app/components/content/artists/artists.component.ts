import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { map, concatAll } from "rxjs/operators";
import { StoredPlaylist } from "mpc-js-web";

import { MpdService } from "../../../shared/services/mpd.service";
import { SearchService } from "../../../shared/services/search.service";
import { PlaylistInputComponent } from "../../../shared/components/playlist-input/playlist-input.component";


@Component({
	selector: "app-artists",
	templateUrl: "./artists.component.html",
	styleUrls: ["./artists.component.scss"]
})
export class ArtistsComponent implements OnInit {
	public artists: string[];
	public sorted: string[];
	public playlists: StoredPlaylist[];

	constructor(
		private newPlaylistDialog: MatDialog,
		private mpd: MpdService,
		private search: SearchService,
	) {}

	public ngOnInit() {
		this.mpd.db.list("AlbumArtist")
			.pipe(
				map((artists) => artists.values()),
				concatAll(),
			)
			.subscribe((artists) => {
				const artistsNormalized = artists.map((artist) => artist.toLowerCase());
				this.artists = artists.filter((artist, index) => {
					return artistsNormalized.indexOf(artist.toLowerCase()) === index;
				});
				this.sorted = [...this.artists];
				this.search.query.subscribe((query) => {
					query = query.toLowerCase();
					this.artists = query.length > 0
						// tslint:disable-next-line:newline-per-chained-call
						? this.sorted.filter((artist) => artist?.toLowerCase().includes(query))
						: this.artists = [...this.sorted];
				});
			});
		this.mpd.stored.list()
			.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists);
		this.mpd.on("changed-stored_playlist")
			.subscribe(() => this.mpd.stored.list()
				.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists));
	}

	public playArtist(artist: string) {
		this.mpd.current.clear();
		this.mpd.db.searchAdd([["AlbumArtist", artist]]);
		this.mpd.playback.play();
	}

	public addQueue(artist: string) {
		this.mpd.db.searchAdd([["AlbumArtist", artist]]);
	}

	public addPlaylist(artist: string, playlist: string) {
		this.mpd.db.searchAddPlaylist([["AlbumArtist", artist]], playlist);
	}

	public addNewPlaylist(artist: string) {
		const dialogRef = this.newPlaylistDialog.open(PlaylistInputComponent, {
			width: "25%",
			data: {
				name: "",
				title: "Create New Playlist",
				label: "Enter Name...",
				action: "Create",
			},
		});

		dialogRef.afterClosed()
			.subscribe((playlist: string) => {
				if (playlist) {
					this.mpd.db.searchAddPlaylist([["AlbumArtist", artist]], playlist);
				}
			});
	}
}
