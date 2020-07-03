import { Component, ViewChild, ElementRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { SwipeGestureEventData, SwipeDirection, TouchGestureEventData, TouchAction } from "tns-core-modules/ui/gestures";
import { Button } from "tns-core-modules/ui/button";
import { Menu } from "nativescript-menu";
import * as Toast from "nativescript-toast";

import { Playback } from "@src/app/playback/playback.component.base";
import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { AuthService } from "@src/app/shared/services/auth.service";


@Component({
	selector: "app-playback-modal",
	templateUrl: "./playback-modal.component.html",
	styleUrls: ["./playback-modal.component.scss"]
})
export class PlaybackModalComponent extends Playback {
	@ViewChild("menuButton", { static: true }) private menuButton: ElementRef<Button>;
	private touchNewVolume = 50;
	private touchNewPos = 0;

	constructor(
		route: ActivatedRoute,
		mpc: MPClientService,
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

	public openMenu() {
		let repeatTitle: string;
		switch (this.repeat) {
			case this.repeatState.normal:
				repeatTitle = "No Repeat";
				break;
			case this.repeatState.repeat:
				repeatTitle = "Repeat";
				break;
			case this.repeatState.repeat_single:
				repeatTitle = "Repeat Single";
				break;
			case this.repeatState.single:
				repeatTitle = "Single";
		}
		Menu.popup({
			view: this.menuButton.nativeElement,
			actions: [
				{ id: "repeat", title: repeatTitle },
				{ id: "shuffle", title: this.shuffle ? "Shuffle" : "No Shuffle" },
				{ id: "xfade", title: this.crossfade ? "Crossfade" : "No Crossfade" },
				{ id: "consume", title: this.consume ? "Consume" : "No Consume" },
			],
		})
		.then((action) => {
			let timeout: any;
			switch (action.id) {
				case "repeat":
					this.toggleRepeat();
					timeout = setTimeout(() => {
						clearTimeout(timeout);
						switch (this.repeat) {
							case this.repeatState.normal:
								Toast.makeText("Repeat disabled")
									.show();
								break;
							case this.repeatState.repeat:
								Toast.makeText("Repeat enabled")
									.show();
								break;
							case this.repeatState.repeat_single:
								Toast.makeText("Repeat Single enabled")
									.show();
								break;
							case this.repeatState.single:
								Toast.makeText("Single enabled")
									.show();
						}
					}, 250);
					break;
				case "shuffle":
					this.toggleShuffle();
					timeout = setTimeout(() => {
						if (this.shuffle) {
							Toast.makeText("Shuffle enabled")
								.show();
						} else {
							Toast.makeText("Shuffle disabled")
								.show();
						}
					}, 250);
					break;
				case "xfade":
					this.toggleCrossfade();
					timeout = setTimeout(() => {
						if (this.crossfade) {
							Toast.makeText("Crossfade enabled")
								.show();
						} else {
							Toast.makeText("Crossfade disabled")
								.show();
						}
					}, 250);
					break;
				case "consume":
					this.toggleConsume();
					timeout = setTimeout(() => {
						if (this.consume) {
							Toast.makeText("Consume enabled")
								.show();
						} else {
							Toast.makeText("Consume disabled")
								.show();
						}
					}, 250);
			}
		})
		.catch((err) => console.error("Menu Error", err));
	}

	protected redirect() {}
}
