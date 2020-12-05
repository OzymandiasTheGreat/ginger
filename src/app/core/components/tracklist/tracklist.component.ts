import { Component, OnInit, NgZone, ViewChild, OnChanges, SimpleChanges } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import { FlatTreeControl } from "@angular/cdk/tree";
import { MatTreeFlattener } from "@angular/material/tree";
import { MatDialog } from "@angular/material/dialog";
import { VirtualScrollerComponent } from "ngx-virtual-scroller";

import { TracklistBaseComponent } from "@src/app/core/components/tracklist/tracklist.component.base";
import { CURRENT_MOPIDY } from "@src/app/types/constants";
import { MpcService } from "@src/app/services/mpc.service";
import { ArtService } from "@src/app/services/art.service";
import { PlaylistService } from "@src/app/services/playlist.service";
import { Track } from "@src/app/types/track";
import { NewPlaylistComponent } from "@src/app/core/components/new-playlist/new-playlist.component";
import { MopidyPlaylist } from "@src/app/types/playlist";


interface TrackNode {
	title: string;
	album: string;
	artist: string;
	albumArtist: string;
	track: Track;
	children?: TrackNode[];
}


interface FlatTrackNode extends TrackNode {
	expandable: boolean;
	level: number;
}


@Component({
	selector: "app-tracklist",
	templateUrl: "./tracklist.component.html",
	styleUrls: ["./tracklist.component.scss"]
})
export class TracklistComponent extends TracklistBaseComponent implements OnInit, OnChanges {
	@ViewChild("scroller") public scroller: CdkVirtualScrollViewport;
	@ViewChild("vscroll") public vscroll: VirtualScrollerComponent;
	public treeControl =  new FlatTreeControl<FlatTrackNode>((node) => node.level, (node) => node.expandable);
	public treeFlattener = new MatTreeFlattener(this._transformer, (node) => node.level, (node) => node.expandable, (node) => node.children);
	public treeDataSource: FlatTrackNode[];
	public grouping: "none" | "album" | "artist" = "none";

	constructor(
		protected zone: NgZone,
		public mpc: MpcService,
		public art: ArtService,
		public pls: PlaylistService,
		protected dialog: MatDialog,
	) {
		super(zone, mpc, art);
		this.mopidy = JSON.parse(window.localStorage.getItem(CURRENT_MOPIDY));
	}

	ngOnInit(): void {
		super.ngOnInit();
	}

	ngOnChanges(changes: SimpleChanges): void {
		super.ngOnChanges(changes);
		if (changes.tracks.previousValue !== changes.tracks.currentValue) {
			this.groupBy(this.grouping);
		}
	}

	private _transformer(node: TrackNode, level: number): FlatTrackNode {
		return {
			title: node.title,
			album: node.album,
			artist: node.artist,
			albumArtist: node.albumArtist,
			track: node.track,
			expandable: !!node.children && node.children.length > 0,
			level: level,
		};
	}

	groupByAlbum(): TrackNode[] {
		const group: TrackNode[] = [];
		for (const track of this.tracks) {
			let parent = group.find((n) => n.album === track.album.title);
			if (!parent) {
				parent = {
					title: null,
					album: track.album.title,
					artist: track.artist.title,
					albumArtist: track.albumArtist.title,
					track: null,
					children: [],
				};
				group.push(parent);
			}
			parent.children.push({
				title: track.title,
				album: track.album.title,
				artist: track.artist.title,
				albumArtist: track.albumArtist.title,
				track: track,
			});
		}
		return group;
	}

	groupByArtist(): TrackNode[] {
		const group: TrackNode[] = [];
		for (const track of this.tracks) {
			let parent = group.find((n) => n.albumArtist === track.albumArtist.title);
			if (!parent) {
				parent = {
					title: null,
					album: track.album.title,
					artist: track.artist.title,
					albumArtist: track.albumArtist.title,
					track: null,
					children: [],
				};
				group.push(parent);
			}
			parent.children.push({
				title: track.title,
				album: track.album.title,
				artist: track.artist.title,
				albumArtist: track.albumArtist.title,
				track: track,
			});
		}
		return group;
	}

	groupBy(key: "none" | "album" | "artist"): void {
		this.grouping = key;
		switch (key) {
			case "none":
				this.treeDataSource = [];
				break;
			case "album":
				this.treeDataSource = this.treeFlattener.flattenNodes(this.groupByAlbum());
				break;
			case "artist":
				this.treeDataSource = this.treeFlattener.flattenNodes(this.groupByArtist());
		}
		this.treeControl.dataNodes = this.treeDataSource;
		this.treeControl.expandAll();
	}

	move(args: CdkDragDrop<Track[]>): void {
		if (this.type === "queue") {
			moveItemInArray(this.tracks, args.previousIndex, args.currentIndex);
			if (this.mopidy) {
				this.mpc.socket.tracklist.move([args.previousIndex, args.previousIndex, args.currentIndex]);
			} else {
				this.mpc.socket.currentPlaylist.move(args.previousIndex, args.currentIndex);
			}
		} else if (this.type === "playlist") {
			moveItemInArray(this.tracks, args.previousIndex, args.currentIndex);
			if (this.mopidy) {
				moveItemInArray((<MopidyPlaylist> this.currentPlaylist).tracks, args.previousIndex, args.currentIndex);
				this.mpc.socket.playlists.save([this.currentPlaylist]);
			} else {
				this.mpc.socket.storedPlaylists.playlistMove(this.currentPlaylist.name, args.previousIndex, args.currentIndex);
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
		if (this.grouping === "none") {
			this.scroller.scrollToIndex(index);
		} else {
			this.vscroll.scrollToIndex(index);
		}
	}

	nodeHasChildren(_: number, node: FlatTrackNode): boolean {
		return node.expandable;
	}
}
