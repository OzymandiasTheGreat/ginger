import { Component, OnInit } from "@angular/core";
import { Button } from "tns-core-modules/ui/button";
import { prompt, inputType, capitalizationType } from "tns-core-modules/ui/dialogs";
import { screen } from "tns-core-modules/platform";
import * as app from "tns-core-modules/application";
import { fromEvent } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Menu } from "nativescript-menu";

import { Playlists } from "@src/app/content/playlists/playlists.component.base";
import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { SearchService } from "@src/app/shared/services/search.service";


@Component({
	selector: "app-playlists",
	templateUrl: "./playlists.component.html",
	styleUrls: ["./playlists.component.scss"]
})
export class PlaylistsComponent extends Playlists implements OnInit {
	public columns: number;

	constructor(
		mpc: MPClientService,
		search: SearchService,
	) {
		super(mpc, search);
	}

	public ngOnInit() {
		super.ngOnInit();
		this.columns = Math.floor(screen.mainScreen.widthDIPs / 152);
		fromEvent(app, app.orientationChangedEvent)
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((data: app.OrientationChangedEventData) => {
				setTimeout(() => {
					this.columns = Math.floor(screen.mainScreen.widthDIPs / 152);
				}, 100);
			});
	}

	public openPlaylistMenu(name: string, button: Button) {
		Menu.popup({
			view: button,
			actions: [
				{ id: "add", title: "Add to Queue" },
				{ id: "rename", title: "Rename Playlist" },
				{ id: "delete", title: "Delete Playlist" },
			],
		})
		.then((action) => {
			switch (action.id) {
				case "add":
					this.add(name);
					break;
				case "rename":
					prompt({
						cancelable: true,
						capitalizationType: capitalizationType.words,
						inputType: inputType.text,
						message: "Enter New Name...",
						title: "Rename Playlist",
						okButtonText: "Rename",
					})
					.then((result) => {
						if (result.text) {
							this.rename(name, result.text);
						}
					});
					break;
				case "delete":
					this.delete(name);
			}
		});
	}
}
