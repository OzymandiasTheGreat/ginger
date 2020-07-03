import { Component, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { SwipeGestureEventData, SwipeDirection } from "tns-core-modules/ui/gestures";

import { AuthService } from "@src/app/shared/services/auth.service";
import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { Playback } from "@src/app/playback/playback.component.base";
import { PlaybackModalComponent } from "@src/app/shared/components/playback-modal/playback-modal.component";


@Component({
	selector: "app-playback",
	templateUrl: "./playback.component.html",
	styleUrls: ["./playback.component.scss"],
})
export class PlaybackComponent extends Playback {
	constructor(
		route: ActivatedRoute,
		router: RouterExtensions,
		mpc: MPClientService,
		auth: AuthService,
		private vcRef: ViewContainerRef,
		private modalService: ModalDialogService,
	) {
		super(route, router, mpc, auth);
	}

	public openModal(data?: SwipeGestureEventData) {
		if (!data || data.direction === SwipeDirection.up) {
			const options: ModalDialogOptions = {
				viewContainerRef: this.vcRef,
				animated: true,
				fullscreen: true,
			};
			this.modalService.showModal(PlaybackModalComponent, options);
		}
	}

	protected redirect() {
		(<RouterExtensions> this.router).navigate(
			["/settings/connect"],
			{
				queryParams: { redirect: true },
				skipLocationChange: true,
				clearHistory: true,
			}
		);
	}
}
