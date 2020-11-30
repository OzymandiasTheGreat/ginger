import { Component, OnInit, NgZone } from "@angular/core";

import { PlaybackBase } from "@src/app/playback/playback.component.base";
import { CURRENT_MOPIDY } from "@src/app/types/constants";
import { MpcService } from "@src/app/services/mpc.service";
import { ArtService } from "@src/app/services/art.service";


@Component({
	selector: "app-playback",
	templateUrl: "./playback.component.html",
	styleUrls: ["./playback.component.scss"]
})
export class PlaybackComponent extends PlaybackBase implements OnInit {
	public mopidy: boolean;
	public enabled = false;
	public playing: boolean;
	public track: { artist: string, title: string, album: string };
	public trackLength: number;
	public trackPos: number;
	public seekTimer: any;
	public seeking: boolean;

	public repeat: boolean;
	public random: boolean;
	public single: boolean;
	public consume: boolean;

	constructor(zone: NgZone, mpc: MpcService, art: ArtService) {
		super(zone, mpc, art);
	}

	ngOnInit(): void {
		this.mpc.connection.subscribe((conn) => {
			this.mopidy = JSON.parse(window.localStorage.getItem(CURRENT_MOPIDY));
			this.enabled = conn;
			this.setup();
		});
	}

	seek(value: number): void {
		if (this.mopidy) {
			this.mpc.socket.playback.seek([value * 1000]);
		} else {
			this.mpc.socket.playback.seekCur(value);
		}
	}

	overflow(): void {
		if (this.mopidy) {
			Promise.all([
				this.mpc.socket.tracklist.getRepeat(),
				this.mpc.socket.tracklist.getRandom(),
				this.mpc.socket.tracklist.getSingle(),
				this.mpc.socket.tracklist.getConsume(),
			]).then(([repeat, random, single, consume]) => {
				this.repeat = repeat;
				this.random = random;
				this.single = single;
				this.consume = consume;
			});
		} else {
			this.mpc.socket.status.status().then(({ repeat, random, single, consume }) => {
				this.repeat = repeat;
				this.random = random;
				this.single = single;
				this.consume = consume;
			});
		}
	}

	toggleRepeat(): void {
		if (this.mopidy) {
			this.mpc.socket.tracklist.setRepeat([!this.repeat]);
		} else {
			this.mpc.socket.playbackOptions.setRepeat(!this.repeat);
		}
	}

	toggleRandom(): void {
		if (this.mopidy) {
			this.mpc.socket.tracklist.setRandom([!this.random]);
		} else {
			this.mpc.socket.playbackOptions.setRandom(!this.random);
		}
	}

	toggleSingle(): void {
		if (this.mopidy) {
			this.mpc.socket.tracklist.setSingle([!this.single]);
		} else {
			this.mpc.socket.playbackOptions.setSingle(!this.single);
		}
	}

	toggleConsume(): void {
		if (this.mopidy) {
			this.mpc.socket.tracklist.setConsume([!this.consume]);
		} else {
			this.mpc.socket.playbackOptions.setConsume(!this.consume);
		}
	}
}
