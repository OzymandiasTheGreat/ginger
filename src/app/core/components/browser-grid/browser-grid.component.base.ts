import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

import { PlaylistService } from "@src/app/services/playlist.service";


export enum GridType {
	playlist,
	directory,
	artist,
	album,
}


export interface GridItem {
	name: string;
	uri: string;
	type: GridType;
}


export interface GridEvent {
	action: "play" | "queue" | "playlist" | "remove" | "navigate";
	payload?: any;
}


@Component({
	selector: "app-browser-grid",
	template: "",
})
export class BrowserGridBaseComponent implements OnInit {
	@Input() public type: GridType;
	@Input() public items: GridItem[];
	@Input() public covers: { [album: string]: string[] };
	@Input() public artists: { [artist: string]: string[] };
	@Output() public input: EventEmitter<GridEvent>;
	public types = GridType;

	constructor(
		public pls: PlaylistService,
	) {
		this.input = new EventEmitter<GridEvent>();
	}

	ngOnInit(): void { }

	emit(event: GridEvent): void {
		this.input.emit(event);
	}

	play(uri: string): void {
		this.emit({ action: "play", payload: { uri } });
	}

	navigate(uri: string): void {
		this.emit({ action: "navigate", payload: { uri } });
	}
}
