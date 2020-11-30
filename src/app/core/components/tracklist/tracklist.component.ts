import { Component, OnInit, NgZone, ViewChild, ElementRef } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import {MatDialog } from "@angular/material/dialog";

import { TracklistBaseComponent } from "@src/app/core/components/tracklist/tracklist.component.base";
import { CURRENT_MOPIDY } from "@src/app/types/constants";
import { MpcService } from "@src/app/services/mpc.service";
import { PlaylistService } from "@src/app/services/playlist.service";
import { Track } from "@src/app/types/track";
import { NewPlaylistComponent } from "@src/app/core/components/new-playlist/new-playlist.component";


@Component({
	selector: "app-tracklist",
	templateUrl: "./tracklist.component.html",
	styleUrls: ["./tracklist.component.scss"]
})
export class TracklistComponent extends TracklistBaseComponent implements OnInit {
	@ViewChild("scroller") public scroller: CdkVirtualScrollViewport;

	constructor(
		protected zone: NgZone,
		public mpc: MpcService,
		public pls: PlaylistService,
		protected dialog: MatDialog,
	) {
		super(zone, mpc);
		this.mopidy = JSON.parse(window.localStorage.getItem(CURRENT_MOPIDY));
	}

	ngOnInit(): void {
		super.ngOnInit();
	}

	move(args: CdkDragDrop<Track[]>): void {
		if (this.type === "queue") {
			moveItemInArray(this.tracks, args.previousIndex, args.currentIndex);
			if (this.mopidy) {
				this.mpc.socket.tracklist.move([args.previousIndex, args.previousIndex, args.currentIndex]);
			} else {
				this.mpc.socket.currentPlaylist.move(args.previousIndex, args.currentIndex);
			}
		}
	}

	newPlaylist(tracks: Track[]): void {
		const ref = this.dialog.open(NewPlaylistComponent, {
			data: { name: "New playlist" },
		});
		ref.afterClosed().subscribe((name) => {
			this.pls.create(name, tracks);
		});
	}

	addPlaylist(uri: string, tracks: Track[]): void {
		this.pls.add(uri, tracks);
	}

	scrollTo(): void {
		const index = this.tracks.findIndex((track) => track.id === this.currentTrack.id);
		this.scroller.scrollToIndex(index);
	}
}
