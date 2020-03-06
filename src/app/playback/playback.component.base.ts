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
	public artSize = [48, 48];
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
					this.connected = false;
					const segments = flattenUrl(this.route.snapshot.children);
					this.auth.redirectUrl = this.codec.encodeKey(segments.join("/"))
						.replace(/\(/, "%28")
						.replace(/\)/, "%29");
					this.redirect();
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

	public stop() {
		this.mpc.playback.stop();
	}

	public previous() {
		this.mpc.playback.previous();
	}

	public forward() {
		this.mpc.playback.next();
	}

	public toggleRepeat() {
		switch (this.repeat) {
			case RepeatState.normal:
				this.mpc.playback.repeat(true);
				break;
			case RepeatState.repeat:
				this.mpc.playback.single(true);
				break;
			case RepeatState.repeat_single:
				this.mpc.playback.repeat(false);
				break;
			case RepeatState.single:
				this.mpc.playback.single(false);
		}
	}

	public toggleShuffle() {
		this.mpc.playback.shuffle(!this.shuffle);
	}

	public toggleCrossfade() {
		this.mpc.playback.crossfade(this.crossfade ? 0 : 5);
	}

	public toggleConsume() {
		this.mpc.playback.consume(!this.consume);
	}

	public setVolume(volume: number) {
		this.mpc.playback.volume(volume);
	}

	public toggleMute(event?: Event) {
		if (event) {
			event.stopPropagation();
		}
		if (this.volume > 0) {
			this.previousVolume = this.volume;
			this.setVolume(0);
		} else {
			this.setVolume(this.previousVolume);
		}
	}

	public seek(time: number) {
		clearInterval(this.seekTimer);
		this.mpc.playback.seek(Math.floor(time / this.seekMultiplier));
	}

	protected formatTime(value: number) {
		if (!isNaN(value)) {
			const time = Math.floor(value / this.seekMultiplier);
			const minutes = Math.floor(time / 60);
			let seconds: string | number = Math.floor(time % 60);
			if (seconds < 10) {
				seconds = `0${seconds}`;
			}
			return `${minutes}:${seconds}`;
		}
		return "0:00";
	}

	protected redirect() {
		this.router.navigate(
			["/settings/connect"],
			{
				queryParams: { redirect: true },
				skipLocationChange: true,
			},
		);
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
				this.seekTimer = setInterval(() => this.seekPos += 0.1, this.seekInterval);
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
