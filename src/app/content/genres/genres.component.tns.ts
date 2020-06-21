import { Component, OnInit } from "@angular/core";
import { screen } from "tns-core-modules/platform";
import { Button } from "tns-core-modules/ui/button";
import { prompt, inputType, capitalizationType } from "tns-core-modules/ui/dialogs";
import * as app from "tns-core-modules/application";
import { fromEvent } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Menu } from "nativescript-menu";

import { Genres } from "@src/app/content/genres/genres.component.base";
import { MpdService } from "@src/app/shared/services/mpd.service";
import { SearchService } from "@src/app/shared/services/search.service";


@Component({
	selector: "app-genres",
	templateUrl: "./genres.component.html",
	styleUrls: ["./genres.component.scss"],
})
export class GenresComponent extends Genres implements OnInit {
	public columns: number;

	constructor(mpc: MpdService, search: SearchService) {
		super(mpc, search);
	}

	public ngOnInit() {
		super.ngOnInit();
		this.columns = Math.floor(screen.mainScreen.widthDIPs / 152);
		fromEvent(app, app.orientationChangedEvent)
			.pipe(
				takeUntil(this.ngUnsubscribe),
			)
			.subscribe((data: app.OrientationChangedEventData) => {
				setTimeout(() => {
					this.columns = Math.floor(screen.mainScreen.widthDIPs / 152);
				}, 100);
			});
	}

	public openPlaylistMenu(genre: string, button: Button) {
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
					this.add(genre);
					break;
				case "submenu":
					this.openPlaylistSubmenu(genre, button);
			}
		});
	}

	public openPlaylistSubmenu(genre: string, button: Button) {
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
							this.addPlaylist(result.text, genre);
						}
					});
					break;
				case "add":
					this.addPlaylist(action.title, genre);
			}
		});
	}
}
