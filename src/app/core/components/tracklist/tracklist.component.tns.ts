import { Component, OnInit, NgZone, ViewChild, ElementRef } from "@angular/core";
import { ApplicationSettings, Image, prompt } from "@nativescript/core";
import { ListViewEventData, RadListView } from "nativescript-ui-listview";
import { Menu } from "nativescript-menu";

import { TracklistBaseComponent } from "@src/app/core/components/tracklist/tracklist.component.base";
import { CURRENT_MOPIDY } from "@src/app/types/constants";
import { MpcService } from "@src/app/services/mpc.service";
import { PlaylistService } from "@src/app/services/playlist.service";
import { Track } from "@src/app/types/track";


@Component({
	selector: "app-tracklist",
	templateUrl: "./tracklist.component.html",
	styleUrls: ["./tracklist.component.scss"]
})
export class TracklistComponent extends TracklistBaseComponent implements OnInit {
	@ViewChild("listView") public listView: ElementRef<RadListView>;

	constructor(
		protected zone: NgZone,
		public mpc: MpcService,
		public pls: PlaylistService,
	) {
		super(zone, mpc);
		this.mopidy = ApplicationSettings.getBoolean(CURRENT_MOPIDY);
	}

	ngOnInit(): void {
		super.ngOnInit();
	}

	overflow(menu: Image, tracks: Track[]): void {
		const actions: Array<{ id: string, title: string }> = [];
		if (this.type === "queue") {
			actions.push({ id: "remove", title: "Remove" });
		}
		actions.push({ id: "addPls", title: "Add to playlist" });
		Menu.popup({
			view: menu,
			actions,
		}).then((action) => {
			switch (action.id) {
				case "remove":
					this.remove(tracks);
					break;
				case "addPls":
					this.playlistMenu(menu, tracks);
					break;
			}
		});
	}

	playlistMenu(menu: Image, tracks: Track[]): void {
		const actions: Array<{ id: string, title: string }> = [
			{ id: "new", title: "New playlist" },
		];
		for (const pls of this.pls.playlists) {
			actions.push({ id: pls.uri, title: pls.name });
		}
		Menu.popup({
			view: menu,
			actions,
		}).then((action) => {
			if (action.id === "new") {
				prompt({
					title: "New playlist",
					message: "Enter playlist's name",
					defaultText: "New playlist",
					okButtonText: "Create",
					cancelButtonText: "Cancel",
				}).then((res) => this.pls.create(res.text, tracks));
			} else {
				this.pls.add(action.id, tracks);
			}
		});
	}

	move(args: ListViewEventData): void {
		if (this.type === "queue") {
			if (this.mopidy) {
				this.mpc.socket.tracklist.move([args.index, args.index, args.data.targetIndex]);
			} else {
				this.mpc.socket.currentPlaylist.move(args.index, args.data.targetIndex);
			}
		}
	}

	scrollTo(): void {
		const index = this.tracks.findIndex((track) => track.id === this.currentTrack.id);
		this.listView.nativeElement.scrollToIndex(index);
	}
}
