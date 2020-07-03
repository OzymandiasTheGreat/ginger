import { Component, AfterViewInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { Button } from "tns-core-modules/ui/button";
import { prompt, inputType, capitalizationType } from "tns-core-modules/ui/dialogs";
import { Menu } from "nativescript-menu";
import { PlaylistItem, Song } from "mpc-js-web";

import { AlbumList } from "@src/app/shared/components/album-list/album-list.component.base";
import { MPClientService } from "@src/app/shared/services/mpclient.service";


@Component({
	selector: "app-album-list",
	templateUrl: "./album-list.component.html",
	styleUrls: ["./album-list.component.scss"],
})
export class AlbumListComponent extends AlbumList implements AfterViewInit {
	constructor(
		router: RouterExtensions,
		mpc: MPClientService,
	) {
		super(router, mpc);
	}

	public ngAfterViewInit() {}

	public openSortMenu(button: Button) {
		Menu.popup({
			view: button,
			actions: [
				{ id: "initial", title: "Initial" },
				{ id: "artist-asc", title: "Artist Asc." },
				{ id: "artist-desc", title: "Artist Desc." },
				{ id: "album-asc", title: "Album Asc." },
				{ id: "album-desc", title: "Album Desc." },
				{ id: "year-asc", title: "Year Asc." },
				{ id: "year-desc", title: "Year Desc." },
			],
		})
		.then((action) => {
			switch (action.id) {
				case "initial":
					this.sortView(this.playlistSort.none);
					break;
				case "artist-asc":
					this.sortView(this.playlistSort.artistAsc);
					break;
				case "artist-desc":
					this.sortView(this.playlistSort.artistDesc);
					break;
				case "album-asc":
					this.sortView(this.playlistSort.albumAsc);
					break;
				case "album-desc":
					this.sortView(this.playlistSort.albumDesc);
					break;
				case "year-asc":
					this.sortView(this.playlistSort.yearAsc);
					break;
				case "year-desc":
					this.sortView(this.playlistSort.yearDesc);
			}
		});
	}

	public openPlaylistMenu(
		toolbar: boolean,
		button: Button,
		songs?: Array<PlaylistItem | Song>,
		album?: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
	) {
		const actions: Array<{ id: string, title: string }> = [];
		if (!this.queue) {
			actions.push({ id: "queue", title: "Add to Queue" });
		}
		if (!this.queue && !this.playlist) {
			actions.push({ id: "submenu", title: "Add to Playlist" });
		}
		if (this.queue) {
			actions.push({ id: "new", title: "New Playlist" });
			this.playlists.forEach((pls) => actions.push({ id: "add", title: pls.name }));
		}
		if (this.playlist && toolbar) {
			actions.push({ id: "delete", title: "Delete Playlist" });
		}
		Menu.popup({
			view: button,
			actions,
		})
		.then((action) => {
			switch (action.id) {
				case "queue":
					if (album) {
						this.addAlbum(album.title, album.artist);
					} else if (songs && songs.length === 1) {
						this.addSong(songs[0].path);
					} else {
						this.addAll();
					}
					break;
				case "submenu":
					this.openPlaylistSubmenu(toolbar, button, songs, album);
					break;
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
						if (result.result) {
							if (album) {
								this.addPlaylist(result.text, album.items);
							} else {
								this.addPlaylist(result.text, songs);
							}
						}
					});
					break;
				case "add":
					if (album) {
						this.addPlaylist(action.title, album.items);
					} else {
						this.addPlaylist(action.title, songs);
					}
					break;
				case "delete":
					this.deletePlaylist();
			}
		});
	}

	public openPlaylistSubmenu(
		toolbar: boolean,
		button: Button,
		songs?: Array<PlaylistItem | Song>,
		album?: { title: string, artist: string, items: Array<(PlaylistItem | Song)> },
	) {
		const actions: Array<{ id: string, title: string }> = [{ id: "new", title: "New Playlist" }];
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
						if (result.result) {
							if (album) {
								this.addPlaylist(result.text, album.items);
							} else {
								this.addPlaylist(result.text, songs);
							}
						}
					});
					break;
				case "add":
					if (album) {
						this.addPlaylist(action.title, album.items);
					} else {
						this.addPlaylist(action.title, songs);
					}
			}
		});
	}
}
