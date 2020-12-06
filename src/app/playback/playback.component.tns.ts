import { Component, OnInit, NgZone, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { ApplicationSettings, TouchGestureEventData, TouchAction, Button } from "@nativescript/core";
import { Menu } from "nativescript-menu";

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

	@ViewChild("menu") public menuBtn: ElementRef<Button>;

	constructor(
		protected zone: NgZone,
		protected router: RouterExtensions,
		public mpc: MpcService,
		public art: ArtService,
	) {
		super(zone, mpc, art);
	}

	ngOnInit(): void {
		this.mpc.connection.subscribe((conn) => {
			this.enabled = conn;
			if (conn) {
				this.mopidy = ApplicationSettings.getBoolean(CURRENT_MOPIDY);
				this.setup();
				this.router.navigate(["/queue"]);
			} else {
				this.router.navigate(["/connect"], { queryParams: { reconnect: true } });
			}
		});
	}

	touch(args: TouchGestureEventData): void {
		if (args.action === TouchAction.down || args.action === TouchAction.move) {
			this.seeking = true;
		} else {
			setTimeout(() => {
				this.seeking = false;
			}, 100);
		}
	}

	seek(args): void {
		if (this.seeking) {
			const slider = args.object;
			if (this.mopidy) {
				this.mpc.socket.playback.seek([slider.value * 1000]);
			} else {
				this.mpc.socket.playback.seekCur(slider.value);
			}
		}
	}

	private buildOverflow(repeat: boolean, random: boolean, single: boolean, consume: boolean): void {
		const actions: Array<{ id: string, title: string }> = [
			{ id: "repeat", title: `Repeat: ${repeat ? "ON" : "OFF"}` },
			{ id: "random", title: `Random: ${random ? "ON" : "OFF"}` },
			{ id: "single", title: `Single: ${single ? "ON" : "OFF"}` },
			{ id: "consume", title: `Consume: ${consume ? "ON" : "OFF"}` },
		];
		Menu.popup({
			view: this.menuBtn.nativeElement,
			actions,
		}).then((action) => {
			switch (action.id) {
				case "repeat":
					if (this.mopidy) {
						this.mpc.socket.tracklist.setRepeat([!repeat]);
					} else {
						this.mpc.socket.playbackOptions.setRepeat(!repeat);
					}
					break;
				case "random":
					if (this.mopidy) {
						this.mpc.socket.tracklist.setRandom([!random]);
					} else {
						this.mpc.socket.playbackOptions.setRandom(!random);
					}
					break;
				case "single":
					if (this.mopidy) {
						this.mpc.socket.tracklist.setSingle([!single]);
					} else {
						this.mpc.socket.playbackOptions.setSingle(!single);
					}
					break;
				case "consume":
					if (this.mopidy) {
						this.mpc.socket.tracklist.setConsume([!consume]);
					} else {
						this.mpc.socket.playbackOptions.setConsume(!consume);
					}
			}
		});
	}

	overflow(): void {
		if (this.mopidy) {
			Promise.all([
				this.mpc.socket.tracklist.getRepeat(),
				this.mpc.socket.tracklist.getRandom(),
				this.mpc.socket.tracklist.getSingle(),
				this.mpc.socket.tracklist.getConsume(),
			]).then(([repeat, random, single, consume]) => {
				this.buildOverflow(repeat, random, single, consume);
			});
		} else {
			this.mpc.socket.status.status().then(({ repeat, random, single, consume }) => {
				this.buildOverflow(repeat, random, single, consume);
			});
		}
	}
}
