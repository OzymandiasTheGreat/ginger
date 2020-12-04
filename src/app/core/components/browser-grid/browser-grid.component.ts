import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";

import { BrowserGridBaseComponent } from "@src/app/core/components/browser-grid/browser-grid.component.base";
import { PlaylistService } from "@src/app/services/playlist.service";
import { NewPlaylistComponent } from "@src/app/core/components/new-playlist/new-playlist.component";


@Component({
	selector: "app-browser-grid",
	templateUrl: "./browser-grid.component.html",
	styleUrls: ["./browser-grid.component.scss"]
})
export class BrowserGridComponent extends BrowserGridBaseComponent implements OnInit {
	constructor(
		public pls: PlaylistService,
		protected dialog: MatDialog,
	) {
		super(pls);
	}

	ngOnInit(): void {
		super.ngOnInit();
	}

	queue(uri: string): void {
		this.emit({ action: "queue", payload: { uri } });
	}

	remove(uri: string): void {
		this.emit({ action: "remove", payload: { uri } });
	}

	new_playlist(uri: string): void {
		const ref = this.dialog.open(NewPlaylistComponent, {
			data: { name: "New playlist" },
		});
		ref.afterClosed().subscribe((name: string) => {
			this.emit({ action: "playlist", payload: { name, uri } });
		});
	}

	add_playlist(target: string, uri: string): void {
		this.emit({ action: "playlist", payload: { target, uri } });
	}
}
