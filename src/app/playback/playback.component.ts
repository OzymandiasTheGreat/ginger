import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { HttpUrlEncodingCodec } from "@angular/common/http";
import { MediaMatcher } from "@angular/cdk/layout";
import { PlaylistItem } from "mpc-js-web";

import { AuthService } from "@src/app/shared/services/auth.service";
import { MpdService } from "@src/app/shared/services/mpd.service";
import { flattenUrl } from "@src/app/shared/functions/route";


export enum RepeatState {
	normal,
	single,
	repeat,
	repeat_single,
}


@Component({
	selector: "app-playback",
	templateUrl: "./playback.component.html",
	styleUrls: ["./playback.component.scss"]
})
export class PlaybackComponent implements OnInit, OnDestroy {
	public artSize = [64, 64];
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

	private mobileQueryListener: (event: MediaQueryListEvent) => void;
	private mobileQuery: MediaQueryList;
	private codec: HttpUrlEncodingCodec;
	private seekInterval = 100;
	private seekMultiplier = 10;
	private seekTimer: number;

	constructor(
		private media: MediaMatcher,
		private cd: ChangeDetectorRef,
		private router: Router,
		private route: ActivatedRoute,
		private auth: AuthService,
		private mpd: MpdService,
	) {
		this.codec = new HttpUrlEncodingCodec();
		this.mobileQuery = this.media.matchMedia("(max-width: 768px)");
		this.mobileQueryListener = (event: MediaQueryListEvent) => {
			this.artSize = event.matches ? [32, 32] : [64, 64];
			this.cd.detectChanges();
		};
		this.mobileQuery.addEventListener("change", this.mobileQueryListener);
	}

	public ngOnDestroy() {
		window.clearInterval(this.seekTimer);
		this.mobileQuery.removeEventListener("change", this.mobileQueryListener);
	}

	public ngOnInit() {
		this.artSize = this.mobileQuery.matches ? [32, 32] : [64, 64];
		this.auth.authorized.subscribe((authorized) => {
			if (authorized) {
				this.mpd.currentSong.subscribe((song) => {
					this.currentSong = song;
				});
				this.mpd.status.subscribe((status) => {
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
							this.seekTimer = window.setInterval(() => this.seekPos += 1, this.seekInterval);
							break;
						case "stop":
							this.seekPos = 0;
						case "pause":
							window.clearInterval(this.seekTimer);
					}
				});
				this.mpd.on("changed-player")
					.subscribe(() => {
						this.mpd.currentSong.subscribe((song) => {
							this.currentSong = song;
						});
						this.mpd.status.subscribe((status) => {
							this.state = status.state;
							this.seekMax = status.duration * this.seekMultiplier;
							this.seekPos = status.elapsed * this.seekMultiplier;
							switch (status.state) {
								case "play":
									this.seekTimer = window.setInterval(() => this.seekPos += 1, this.seekInterval);
									break;
								case "stop":
									this.seekPos = 0;
								case "pause":
									window.clearInterval(this.seekTimer);
							}
						});
					});
				this.mpd.on("changed-options")
					.subscribe(() => this.mpd.status.subscribe((status) => {
						this.shuffle = status.random;
						this.crossfade = !!status.xfade;
						this.consume = status.consume;
						this.repeat = status.repeat
							? (status.single ? RepeatState.repeat_single : RepeatState.repeat)
							: (status.single ? RepeatState.single : RepeatState.normal);
					}));
				this.mpd.on("changed-mixer")
					.subscribe(() => this.mpd.status.subscribe((status) => {
						this.volume = status.volume;
					}));
				this.connected = true;
			} else {
				const segments = flattenUrl(this.route.snapshot.children);
				this.auth.redirectUrl = this.codec.encodeKey(segments.join("/"))
					.replace(/\(/, "%28")
					.replace(/\)/, "%29");
				this.router.navigate(["/connect"], { queryParams: { redirect: true } });
				this.connected = false;
			}
		});
	}

	public play() {
		if (this.state !== "play") {
			this.mpd.playback.play();
		} else {
			this.mpd.playback.pause();
		}
	}

	public stop() {
		this.mpd.playback.stop();
	}

	public previous() {
		this.mpd.playback.previous();
	}

	public forward() {
		this.mpd.playback.next();
	}

	public toggleRepeat() {
		switch (this.repeat) {
			case RepeatState.normal:
				this.mpd.playback.repeat(true);
				break;
			case RepeatState.repeat:
				this.mpd.playback.single(true);
				break;
			case RepeatState.repeat_single:
				this.mpd.playback.repeat(false);
				break;
			case RepeatState.single:
				this.mpd.playback.single(false);
		}
	}

	public toggleShuffle() {
		this.mpd.playback.shuffle(!this.shuffle);
	}

	public toggleCrossfade() {
		this.mpd.playback.crossfade(this.crossfade ? 0 : 5);
	}

	public toggleConsume() {
		this.mpd.playback.consume(!this.consume);
	}

	public setVolume(volume: number) {
		this.mpd.playback.volume(volume);
	}

	public toggleMute(event: Event) {
		event.stopPropagation();
		if (this.volume > 0) {
			this.previousVolume = this.volume;
			this.setVolume(0);
		} else {
			this.setVolume(this.previousVolume);
		}
	}

	public seek(time: number) {
		window.clearInterval(this.seekTimer);
		this.mpd.playback.seek(Math.round(time / this.seekMultiplier));
	}

	public seekDisplay(value: number): string {
		const time = Math.round(value / 10); // this is unbound in the template
		const minutes = Math.round(time / 60);
		let seconds: string | number = Math.round(time % 60);

		if (seconds < 10) {
			seconds = `0${seconds}`;
		}

		return `${minutes}:${seconds}`;
	}
}
