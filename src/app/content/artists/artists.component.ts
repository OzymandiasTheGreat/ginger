import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

import { Artists } from "@src/app/content/artists/artists.component.base";
import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { SearchService } from "@src/app/shared/services/search.service";
import { PlaylistInputComponent } from "@src/app/shared/components/playlist-input/playlist-input.component";


@Component({
	selector: "app-artists",
	templateUrl: "./artists.component.html",
	styleUrls: ["./artists.component.scss"],
})
export class ArtistsComponent extends Artists {
	constructor(
		private newPlaylistDialog: MatDialog,
		mpc: MPClientService,
		search: SearchService,
	) {
		super(mpc, search);
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
					this.addPlaylist(artist, playlist);
				}
			});
	}
}
