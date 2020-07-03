import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
// import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
// import { MatAccordion } from "@angular/material/expansion";
import { PlaylistItem, Song } from "mpc-js-web";

import { AlbumList } from "@src/app/shared/components/album-list/album-list.component.base";
import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { PlaylistInputComponent } from "@src/app/shared/components/playlist-input/playlist-input.component";


@Component({
	selector: "app-album-list",
	templateUrl: "./album-list.component.html",
	styleUrls: ["./album-list.component.scss"]
})
export class AlbumListComponent extends AlbumList {
	// @ViewChild("scrollViewPort", { static: true }) public scrollViewPort: CdkVirtualScrollViewport;
	// @ViewChild("accordion", { static: true }) public accordion: MatAccordion;

	constructor(
		router: Router,
		mpc: MPClientService,
		public playlistInputDialog: MatDialog,
	) {
		super(router, mpc);
	}

	public openPlaylistInputDialog(songs?: Array<PlaylistItem | Song>) {
		const dialogRef = this.playlistInputDialog.open(PlaylistInputComponent, {
			width: "25%",
			data: {
				name: "",
				title: "Create New Playlist",
				label: "Enter Name...",
				action: "Create",
			},
		});

		dialogRef.afterClosed()
			.subscribe((name) => {
				if (name) {
					this.addPlaylist(name, songs);
				}
			});
	}

	public playAlbum(album: string, artist: string, event?: Event) {
		if (event) {
			event.stopPropagation();
		}
		super.playAlbum(album, artist);
	}

	public removeAlbum(name: string, event?: Event) {
		if (event) {
			event.stopPropagation();
		}
		super.removeAlbum(name);
	}

	public addAlbum(album: string, artist: string, event?: Event) {
		if (event) {
			event.stopPropagation();
		}
		super.addAlbum(album, artist);
	}

	// public scrollCurrent() {
	// 	const index = this.songs.findIndex((album) => album[1].some((song) => song.id === this.currentSong.id));
	// 	this.scrollViewPort.scrollToIndex(index);
	// 	this.accordion.openAll();
	// }
}
