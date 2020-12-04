import { Component, OnInit } from "@angular/core";
import { Button, prompt } from "@nativescript/core";
import { Menu } from "nativescript-menu";

import { BrowserGridBaseComponent, GridType } from "@src/app/core/components/browser-grid/browser-grid.component.base";
import { PlaylistService } from "@src/app/services/playlist.service";


@Component({
	selector: "app-browser-grid",
	templateUrl: "./browser-grid.component.html",
	styleUrls: ["./browser-grid.component.scss"]
})
export class BrowserGridComponent extends BrowserGridBaseComponent implements OnInit {
	constructor(
		public pls: PlaylistService,
	) {
		super(pls);
	}

	ngOnInit(): void {
		super.ngOnInit();
	}

	overflow(view: Button, uri: string): void {
		const actions: Array<{ id: string, title: string }> = [
			{ id: "queue", title: "Add to queue" },
			{ id: "playlist", title: "Add to playlist" },
		];
		if (this.type === GridType.playlist) {
			actions.push({ id: "remove", title: "Remove" });
		}
		Menu.popup({
			view,
			actions,
		}).then((action) => {
			switch (action.id) {
				case "queue":
					this.emit({ action: "queue", payload: { uri } });
					break;
				case "playlist":
					this.playlists(view, uri);
					break;
				case "remove":
					this.emit({ action: "remove", payload: { uri } });
					break;
			}
		});
	}

	playlists(view: Button, uri: string): void {
		const actions: Array<{ id: string, title: string }> = [
			{ id: "new", title: "New playlist" },
		];
		for (const pls of this.pls.playlists) {
			actions.push({ id: pls.uri, title: pls.name });
		}
		Menu.popup({
			view,
			actions,
		}).then((action) => {
			if (action.id === "new") {
				prompt({
					title: "New playlist",
					defaultText: "New playlist",
					okButtonText: "Create",
					cancelButtonText: "Cancel",
				}).then((res) => this.emit({ action: "playlist", payload: { name: res.text, uri } }));
			} else {
				this.emit({ action: "playlist", payload: { target: action.id, uri } });
			}
		});
	}
}
