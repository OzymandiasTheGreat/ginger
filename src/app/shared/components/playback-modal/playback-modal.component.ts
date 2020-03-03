import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { Playback } from "@src/app/playback/playback.component.base";
import { MpdService } from "@src/app/shared/services/mpd.service";
import { AuthService } from "@src/app/shared/services/auth.service";


@Component({
	selector: "app-playback-modal",
	templateUrl: "./playback-modal.component.html",
	styleUrls: ["./playback-modal.component.scss"]
})
export class PlaybackModalComponent extends Playback {
	constructor(
		route: ActivatedRoute,
		mpc: MpdService,
		auth: AuthService,
	) {
		super(route, null, mpc, auth);
	}

	protected redirect() {}
}
