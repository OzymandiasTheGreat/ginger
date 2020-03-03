import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";

import { AuthService } from "@src/app/shared/services/auth.service";
import { MpdService } from "@src/app/shared/services/mpd.service";
import { Playback } from "@src/app/playback/playback.component.base";


@Component({
	selector: "app-playback",
	templateUrl: "./playback.component.html",
	styleUrls: ["./playback.component.scss"],
})
export class PlaybackComponent extends Playback {
	constructor(
		route: ActivatedRoute,
		router: RouterExtensions,
		mpc: MpdService,
		auth: AuthService,
	) {
		super(route, router, mpc, auth);
	}

	protected redirect() {
		(<RouterExtensions> this.router).navigate(
			["/connect"],
			{
				queryParams: { redirect: true },
				skipLocationChange: true,
				clearHistory: true,
			}
		);
	}
}
