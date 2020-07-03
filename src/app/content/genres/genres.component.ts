import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { StoredPlaylist } from "mpc-js-web";

import { Genres } from "@src/app/content/genres/genres.component.base";
import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { SearchService } from "@src/app/shared/services/search.service";
import { PlaylistInputComponent } from "@src/app/shared/components/playlist-input/playlist-input.component";


@Component({
	selector: "app-genres",
	templateUrl: "./genres.component.html",
	styleUrls: ["./genres.component.scss"]
})
export class GenresComponent extends Genres {
	constructor(
		mpc: MPClientService,
		search: SearchService,
		private dialog: MatDialog,
	) {
		super(mpc, search);
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
					this.addPlaylist(name, genre);
				}
			});
	}
}
