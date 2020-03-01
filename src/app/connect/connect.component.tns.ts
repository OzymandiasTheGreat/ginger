import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { Page } from "tns-core-modules/ui/page";
import * as appSettings from "tns-core-modules/application-settings";
import { takeUntil } from "rxjs/operators";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { AuthService } from "@src/app/shared/services/auth.service";
import { Connect } from "@src/app/connect/connect.component.base";
import { ConnectionComponent } from "@src/app/shared/components/connection/connection.component";

@Component({
	selector: "app-connect",
	templateUrl: "./connect.component.html",
	styleUrls: ["./connect.component.scss"],
})
export class ConnectComponent extends Connect implements OnInit {
	constructor(
		private router: RouterExtensions,
		private page: Page,
		private modalService: ModalDialogService,
		private vcRef: ViewContainerRef,
		route: ActivatedRoute,
		mpc: MpdService,
		auth: AuthService,
	) {
		super(route, mpc, auth);
		this.address = appSettings.getString("MPD_ADDRESS", "");
		this.password = appSettings.getString("MPD_PASSWORD", "");
	}

	public ngOnInit() {
		if (this.route.snapshot.queryParamMap.get("redirect") === "true" && this.address.length > 0) {
			this.openConnection();
		}
	}

	public openConnection(): void {
		appSettings.setString("MPD_ADDRESS", this.address);
		appSettings.setString("MPD_PASSWORD", this.password);

		setTimeout(() => {
			const options: ModalDialogOptions = {
				viewContainerRef: this.vcRef,
				context: {},
				fullscreen: false,
				target: this.page,
			};
			this.modalService.showModal(ConnectionComponent, options);

			this.connect()
				.pipe(takeUntil(this.ngUnsubscribe))
				.subscribe((authorized) => {
					if (this.page && this.page.modal) {
						this.page.modal.closeModal();
					}
					if (authorized && this.redirect) {
						this.router.navigateByUrl(
							this.auth.redirectUrl ? this.auth.redirectUrl : "/library/queue",
							{ clearHistory: true },
						);
					}
				});
		}, 250);
	}
}
