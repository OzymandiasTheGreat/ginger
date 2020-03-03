import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MediaMatcher } from "@angular/cdk/layout";

import { Playback } from "@src/app/playback/playback.component.base";
import { AuthService } from "@src/app/shared/services/auth.service";
import { MpdService } from "@src/app/shared/services/mpd.service";


@Component({
	selector: "app-playback",
	templateUrl: "./playback.component.html",
	styleUrls: ["./playback.component.scss"]
})
export class PlaybackComponent extends Playback implements OnInit {

	private mobileQueryListener: (event: MediaQueryListEvent) => void;
	private mobileQuery: MediaQueryList;

	constructor(
		private media: MediaMatcher,
		private cd: ChangeDetectorRef,
		route: ActivatedRoute,
		router: Router,
		mpc: MpdService,
		auth: AuthService,
	) {
		super(route, router, mpc, auth)
		this.mobileQuery = this.media.matchMedia("(max-width: 768px)");
		this.mobileQueryListener = (event: MediaQueryListEvent) => {
			this.artSize = event.matches ? [48, 48] : [64, 64];
			this.cd.detectChanges();
		};
		this.mobileQuery.addEventListener("change", this.mobileQueryListener);
	}

	public ngOnInit() {
		super.ngOnInit();
		this.artSize = this.mobileQuery.matches ? [48, 48] : [64, 64];
	}

	public get seekDisplay() {
		return (value: number) => this.formatTime(value);
	}
}
