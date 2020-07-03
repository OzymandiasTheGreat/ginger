import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { screen } from "tns-core-modules/platform";
import { Button } from "tns-core-modules/ui/button";
import { prompt, inputType, capitalizationType } from "tns-core-modules/ui/dialogs";
import * as app from "tns-core-modules/application";
import { fromEvent } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Menu } from "nativescript-menu";
import { Song, Playlist, Directory } from "mpc-js-web";

import { Files } from "@src/app/content/files/files.component.base";
import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { SearchService } from "@src/app/shared/services/search.service";


@Component({
	selector: "app-files",
	templateUrl: "./files.component.html",
	styleUrls: ["./files.component.scss"],
})
export class FilesComponent extends Files implements OnInit {
	public columns: number;

	constructor(
		router: RouterExtensions,
		route: ActivatedRoute,
		mpc: MPClientService,
		search: SearchService,
	) {
		super(router, route, mpc, search);
	}

	public ngOnInit() {
		super.ngOnInit();
		this.columns = Math.floor(screen.mainScreen.widthDIPs / 114);
		fromEvent(app, app.orientationChangedEvent)
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((data: app.OrientationChangedEventData) => {
				setTimeout(() => {
					this.columns = Math.floor(screen.mainScreen.widthDIPs / 114);
				}, 100);
			});
	}

	public openPlaylistMenu(uri: string, button: Button) {
		Menu.popup({
			view: button,
			actions: [
				{ id: "queue", title: "Add to Queue" },
				{ id: "submenu", title: "Add to Playlist" },
			],
		})
		.then((action) => {
			switch (action.id) {
				case "queue":
					this.add(uri);
					break;
				case "submenu":
					this.openPlaylistSubmenu(uri, button);
			}
		});
	}

	public openPlaylistSubmenu(uri: string, button: Button) {
		const actions: Array<{ id: string, title: string }> = [];
		actions.push({ id: "new", title: "New Playlist" });
		this.playlists.forEach((pls) => actions.push({ id: "add", title: pls.name }));
		Menu.popup({
			view: button,
			actions,
		})
		.then((action) => {
			switch (action.id) {
				case "new":
					prompt({
						cancelable: true,
						capitalizationType: capitalizationType.none,
						inputType: inputType.text,
						message: "Enter Name...",
						title: "Create New Playlist",
						okButtonText: "Create",
					})
					.then((result) => {
						if (result.text) {
							this.mpc.db.searchAddPlaylist([["file", uri]], result.text);
						}
					});
					break;
				case "add":
					this.mpc.db.searchAddPlaylist([["file", uri]], action.title);
			}
		});
	}

	public templateSelector(
		entry: Song | Playlist | Directory,
		index: number,
		entries: Array<Song | Playlist | Directory>,
	): "file" | "directory" {
		if (entry.isDirectory()) {
			return "directory";
		}
		return "file";
	}
}
