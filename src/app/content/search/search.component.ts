import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { forkJoin } from "rxjs";
import { Song, StoredPlaylist, PlaylistItem } from "mpc-js-web";

import { Search } from "@src/app/content/search/search.component.base";
import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { extractArtists } from "@src/app/shared/functions/album-extract";
import { PlaylistInputComponent } from "@src/app/shared/components/playlist-input/playlist-input.component";


// tslint:disable:newline-per-chained-call
@Component({
	selector: "app-search",
	templateUrl: "./search.component.html",
	styleUrls: ["./search.component.scss"]
})
export class SearchComponent extends Search implements OnInit {

	constructor(
		route: ActivatedRoute,
		mpc: MPClientService,
		private playlistInputDialog: MatDialog,
	) {
		super(route, mpc);
	}

	public addPlaylist(tag: string, query: string, playlist: string) {
		this.mpc.db.searchAddPlaylist([[tag, query]], playlist);
	}

	public openNewPlaylistDialog(tag: string, query: string) {
		const dialogRef = this.playlistInputDialog.open(PlaylistInputComponent, {
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
					this.mpc.db.searchAddPlaylist([[tag, query]], name);
				}
			});
	}
}
