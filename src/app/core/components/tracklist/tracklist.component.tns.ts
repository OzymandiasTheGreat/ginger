import { Component, OnInit, NgZone, ViewChild, ElementRef } from "@angular/core";
import { ApplicationSettings, Button, Image, prompt } from "@nativescript/core";
import { ListViewEventData, RadListView } from "nativescript-ui-listview";
import { Menu } from "nativescript-menu";

import { TracklistBaseComponent } from "@src/app/core/components/tracklist/tracklist.component.base";
import { CURRENT_MOPIDY } from "@src/app/types/constants";
import { MpcService } from "@src/app/services/mpc.service";
import { PlaylistService } from "@src/app/services/playlist.service";
import { ArtService } from "@src/app/services/art.service";
import { Track } from "@src/app/types/track";
import { MopidyPlaylist } from "@src/app/types/playlist";


@Component({
	selector: "app-tracklist",
	templateUrl: "./tracklist.component.html",
	styleUrls: ["./tracklist.component.scss"]
})
export class TracklistComponent extends TracklistBaseComponent implements OnInit {
	@ViewChild("listView") public listView: ElementRef<RadListView>;
	public grouping: "none" | "album" | "artist" = "none";
	public groupingFunc: (item: Track) => string;

	constructor(
		protected zone: NgZone,
		public mpc: MpcService,
		public art: ArtService,
		public pls: PlaylistService,
	) {
		super(zone, mpc, art);
		this.mopidy = ApplicationSettings.getBoolean(CURRENT_MOPIDY);
	}

	ngOnInit(): void {
		super.ngOnInit();
	}

	overflow(menu: Image, tracks: Track[]): void {
		const actions: Array<{ id: string, title: string }> = [];
		if (this.type !== "queue") {
			actions.push({ id: "queue", title: "Add to queue" });
		}
		if (this.type === "queue" || this.type === "playlist") {
			actions.push({ id: "remove", title: "Remove" });
		}
		actions.push({ id: "addPls", title: "Add to playlist" });
		Menu.popup({
			view: menu,
			actions,
		}).then((action) => {
			switch (action.id) {
				case "queue":
					this.queue(tracks);
					break;
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
		} else if (this.type === "playlist") {
			if (this.mopidy) {
				(<MopidyPlaylist> this.currentPlaylist).tracks.splice(
					args.data.targetIndex,
					0,
					(<MopidyPlaylist> this.currentPlaylist).tracks.splice(args.index, 1)[0],
				);
				this.mpc.socket.playlists.save([this.currentPlaylist]);
			} else {
				this.mpc.socket.storedPlaylists.playlistMove(this.currentPlaylist.name, args.index, args.data.targetIndex);
			}
		}
	}

	scrollTo(): void {
		const index = this.tracks.findIndex((track) => track.id === this.currentTrack.id);
		this.listView.nativeElement.scrollToIndex(index);
	}

	groupBy(key: "none" | "album" | "artist"): void {
		this.grouping = key;
		switch (key) {
			case "album":
				this.groupingFunc = this.groupByAlbum;
				this.listView.nativeElement.groupingFunction = this.groupByAlbum;
				break;
			case "none":
				this.groupingFunc = undefined;
				this.listView.nativeElement.groupingFunction = undefined;
				break;
			case "artist":
				this.groupingFunc = this.groupByArtist;
				this.listView.nativeElement.groupingFunction = this.groupByArtist;
		}
	}

	groupByMenu(view: Button): void {
		const actions: Array<{ id: string, title: string }> = [
			{ id: "none", title: "Ungroup" },
			{ id: "album", title: "By album" },
			{ id: "artist", title: "By artist" },
		];
		Menu.popup({
			view,
			actions,
		}).then((action) => this.groupBy(action.id));
	}

	groupByAlbum(track: Track): string {
		return track.album.title;
	}

	groupByArtist(track: Track): string {
		return track.albumArtist.title;
	}
}
