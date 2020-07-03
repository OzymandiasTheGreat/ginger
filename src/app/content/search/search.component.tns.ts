import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { screen } from "tns-core-modules/platform";
import { Button } from "tns-core-modules/ui/button";
import { prompt, inputType, capitalizationType } from "tns-core-modules/ui/dialogs";
import * as app from "tns-core-modules/application";
import { fromEvent } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Menu } from "nativescript-menu";

import { Search } from "@src/app/content/search/search.component.base";
import { MPClientService } from "@src/app/shared/services/mpclient.service";


@Component({
	selector: "app-search",
	templateUrl: "./search.component.html",
	styleUrls: ["./search.component.scss"],
})
export class SearchComponent extends Search implements OnInit {
	public columns: number;

	constructor(
		route: ActivatedRoute,
		mpc: MPClientService,
	) {
		super(route, mpc);
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

	public openPlaylistMenu(tag: string, query: string, button: Button) {
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
					this.add(tag, query);
					break;
				case "submenu":
					this.openPlaylistSubmenu(tag, query, button);
			}
		});
	}

	public openPlaylistSubmenu(tag: string, query: string, button: Button) {
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
							this.mpc.db.searchAddPlaylist([[tag, query]], result.text);
						}
					});
					break;
				case "add":
					this.mpc.db.searchAddPlaylist([[tag, query]], action.title);
			}
		});
	}
}
