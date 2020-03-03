import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { SwipeGestureEventData, SwipeDirection, TouchGestureEventData, TouchAction } from "tns-core-modules/ui/gestures";

import { Playback } from "@src/app/playback/playback.component.base";
import { MpdService } from "@src/app/shared/services/mpd.service";
import { AuthService } from "@src/app/shared/services/auth.service";


@Component({
	selector: "app-playback-modal",
	templateUrl: "./playback-modal.component.html",
	styleUrls: ["./playback-modal.component.scss"]
})
export class PlaybackModalComponent extends Playback {
	private touchNewVolume = 50;
	private touchNewPos = 0;

	constructor(
		route: ActivatedRoute,
		mpc: MpdService,
		auth: AuthService,
		private params: ModalDialogParams,
	) {
		super(route, null, mpc, auth);
	}

	public onSwipe(data: SwipeGestureEventData) {
		switch (data.direction) {
			case SwipeDirection.down:
				this.params.closeCallback();
		}
	}

	public onTouch(data: TouchGestureEventData) {
		switch (data.action) {
			case TouchAction.cancel:
			case TouchAction.up:
				this.setVolume(this.touchNewVolume);
				this.seek(this.touchNewPos);
		}
	}

	public onVolumeChanged(value: number) {
		this.touchNewVolume = value;
	}

	public onPosChanged(value: number) {
		this.touchNewPos = value;
	}

	protected redirect() {}
}
