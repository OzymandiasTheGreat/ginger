import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

import { Playlists } from "@src/app/content/playlists/playlists.component.base";
import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { SearchService } from "@src/app/shared/services/search.service";
import { PlaylistInputComponent } from "@src/app/shared/components/playlist-input/playlist-input.component";


@Component({
	selector: "app-playlists",
	templateUrl: "./playlists.component.html",
	styleUrls: ["./playlists.component.scss"]
})
export class PlaylistsComponent extends Playlists {
	constructor(
		mpc: MPClientService,
		search: SearchService,
		private renameDialog: MatDialog,
	) {
		super(mpc, search);
	}

	public rename(name: string) {
		const dialogRef = this.renameDialog.open(PlaylistInputComponent, {
			width: "25%",
			data: {
				name,
				title: "Rename Playlist",
				label: "Enter New Name...",
				action: "Rename",
			},
		});

		dialogRef.afterClosed()
			.subscribe((newName) => {
				if (newName) {
					super.rename(name, newName);
				}
			});
	}
}
