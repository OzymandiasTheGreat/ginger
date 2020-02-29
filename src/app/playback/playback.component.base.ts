import { OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HttpUrlEncodingCodec } from "@angular/common/http";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { Status, PlaylistItem } from "mpc-js-web";

import { AuthService } from "@src/app/shared/services/auth.service";
import { MpdService } from "@src/app/shared/services/mpd.service";
import { flattenUrl } from "@src/app/shared/functions/route";


export enum RepeatState {
	normal,
	single,
	repeat,
	repeat_single,
}


export class Playback implements OnInit, OnDestroy {
	public artSize = [32, 32];
	public repeatState = RepeatState;
	public state = "stop";
	public repeat: RepeatState;
	public shuffle: boolean;
	public crossfade: boolean;
	public consume: boolean;
	public volume: number;
	public previousVolume: number;
	public currentSong: PlaylistItem;
	public seekPos: number;
	public seekMax: number;
	public connected = false;

	protected ngUnsubscribe: Subject<void>;
	protected codec: HttpUrlEncodingCodec;
	protected seekInterval = 100;
	protected seekMultiplier = 10;
	protected seekTimer: any;

	constructor(
		protected route: ActivatedRoute,
		protected router: any,
		protected mpc: MpdService,
		protected auth: AuthService,
	) {
		this.ngUnsubscribe = new Subject<void>();
		this.codec = new HttpUrlEncodingCodec();
	}

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
		clearInterval(this.seekTimer);
	}

	public ngOnInit() {
		this.auth.authorized.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((authorized) => {
				if (authorized) {
					this.mpc.currentSong.pipe(takeUntil(this.ngUnsubscribe))
						.subscribe((song) => this.updateCurrentSong(song));
					this.mpc.status.pipe(takeUntil(this.ngUnsubscribe))
						.subscribe((status) => this.updateStatus(status));
					this.mpc.on("changed-player")
						.pipe(takeUntil(this.ngUnsubscribe))
						.subscribe(() => {
							this.mpc.currentSong.pipe(takeUntil(this.ngUnsubscribe))
								.subscribe((song) => this.updateCurrentSong(song));
							this.mpc.status.pipe(takeUntil(this.ngUnsubscribe))
								.subscribe((status) => this.updateStatus(status));
						});
					this.mpc.on("changed-options")
						.pipe(takeUntil(this.ngUnsubscribe))
						.subscribe(() => this.mpc.status.pipe(takeUntil(this.ngUnsubscribe))
							.subscribe((status) => this.updateStatus(status)));
					this.mpc.on("changed-mixer")
						.pipe(takeUntil(this.ngUnsubscribe))
						.subscribe(() => this.mpc.status.pipe(takeUntil(this.ngUnsubscribe))
							.subscribe((status) => this.updateStatus(status)));
					this.connected = true;
				} else {
					const segments = flattenUrl(this.route.snapshot.children);
					this.auth.redirectUrl = this.codec.encodeKey(segments.join("/"))
						.replace(/\(/, "%28")
						.replace(/\)/, "%29");
					// this.router.navigate(["/connect"], { queryParams: { redirect: true } });
					this.connected = false;
				}
			});
	}

	public play() {
		if (this.state !== "play") {
			this.mpc.playback.play();
		} else {
			this.mpc.playback.pause();
		}
	}

	protected updateStatus(status: Status) {
		this.state = status.state;
		this.shuffle = status.random;
		this.crossfade = !!status.xfade;
		this.consume = status.consume;
		this.volume = status.volume;
		this.previousVolume = status.volume;
		this.repeat = status.repeat
			? (status.single ? RepeatState.repeat_single : RepeatState.repeat)
			: (status.single ? RepeatState.single : RepeatState.normal);
		this.seekMax = status.duration * this.seekMultiplier;
		this.seekPos = status.elapsed * this.seekMultiplier;
		switch (status.state) {
			case "play":
				this.seekTimer = setInterval(() => this.seekPos += 1, this.seekInterval);
				break;
			case "stop":
				this.seekPos = 0;
			case "pause":
				clearInterval(this.seekTimer);
		}
	}

	protected updateCurrentSong(song: PlaylistItem) {
		this.currentSong = song;
	}
}
