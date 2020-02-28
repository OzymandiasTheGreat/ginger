import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, Event, NavigationEnd } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import * as path from "path";
import { Song, Playlist, Directory, StoredPlaylist } from "mpc-js-web";

import { flattenUrl } from "@src/app/shared/functions/route";
import { MpdService } from "@src/app/shared/services/mpd.service";
import { SearchService } from "@src/app/shared/services/search.service";
import { PlaylistInputComponent } from "@src/app/shared/components/playlist-input/playlist-input.component";


@Component({
	selector: "app-files",
	templateUrl: "./files.component.html",
	styleUrls: ["./files.component.scss"]
})
export class FilesComponent implements OnInit {
	public basename = path.basename;
	public entries: Array<Song | Playlist | Directory>;
	public sorted: Array<Song | Playlist | Directory>;
	public playlists: StoredPlaylist[];

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private playlistInputDialiog: MatDialog,
		private mpd: MpdService,
		private search: SearchService,
	) {}

	public ngOnInit() {
		this.loadDir();
		this.mpd.stored.list()
			.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists);
		this.router.events.subscribe((event: Event) => {
			if (event instanceof NavigationEnd) {
				this.loadDir();
			}
		});
		this.mpd.on("changed-stored_playlist")
			.subscribe(() => this.mpd.stored.list()
				.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists));
	}

	public loadDir() {
		const segments = flattenUrl(this.route.snapshot.children);
		const uri = segments.join("/") || "/";
		this.mpd.db.listInfo(uri)
			.subscribe((entries) => {
				this.entries = entries;
				this.sorted = [...this.entries];
				this.search.query.subscribe((query) => {
					query = query.toLowerCase();
					this.entries = query.length > 0
						// tslint:disable-next-line:newline-per-chained-call
						? this.sorted.filter((entry) => entry && this.basename(entry.path).toLowerCase().includes(query))
						: [...this.sorted];
				});
			});
	}

	public play(uri: string, single: boolean) {
		if (!single) {
			this.mpd.current.clear();
		}
		this.mpd.current.add(uri, single)
			.subscribe((id: number) => this.mpd.playback.play(id));
	}

	public add(uri: string) {
		this.mpd.current.add(uri, false);
	}

	public openNewPlaylistDialog(uri: string) {
		const dialogRef = this.playlistInputDialiog.open(PlaylistInputComponent, {
			width: "25%",
			data: {
				name: "",
				title: "Create New Playlist",
				label: "Enter Name...",
				action: "Create",
			},
		});

		dialogRef.afterClosed()
			.subscribe((name) => {
				if (name) {
					this.mpd.db.searchAddPlaylist([["file", uri]], name);
				}
			});
	}

	public addPlaylist(uri: string, playlist: string) {
		this.mpd.db.searchAddPlaylist([["file", uri]], playlist);
	}
}
