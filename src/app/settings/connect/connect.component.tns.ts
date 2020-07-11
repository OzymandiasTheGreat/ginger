import { Component, OnInit, ViewContainerRef, NgZone } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { Page } from "tns-core-modules/ui/page";
import * as appSettings from "tns-core-modules/application-settings";
import { takeUntil } from "rxjs/operators";

import * as Toast from "nativescript-toast";

import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { AuthService } from "@src/app/shared/services/auth.service";
import { Connect } from "@src/app/settings/connect/connect.component.base";
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
		private zone: NgZone,
		route: ActivatedRoute,
		mpc: MPClientService,
		auth: AuthService,
	) {
		super(route, mpc, auth);
		this.address = appSettings.getString("MPD_ADDRESS", "");
		this.password = appSettings.getString("MPD_PASSWORD", "");
		this.mopidy = appSettings.getBoolean("MOPIDY", false);
	}

	public ngOnInit() {
		if (this.route.snapshot.queryParamMap.get("redirect") === "true" && this.address.length > 0) {
			this.openConnection();
		}
	}

	public openConnection(): void {
		appSettings.setString("MPD_ADDRESS", this.address);
		appSettings.setString("MPD_PASSWORD", this.password);
		appSettings.setBoolean("MOPIDY", this.mopidy);

		setTimeout(() => {
			const options: ModalDialogOptions = {
				viewContainerRef: this.vcRef,
				context: {},
				fullscreen: false,
				target: this.page,
			};
			this.modalService.showModal(ConnectionComponent, options);

			this.connect()
				.pipe(
					takeUntil(this.ngUnsubscribe),
				)
				.subscribe((authorized) => {
					setTimeout(() => {
						if (this.page && this.page.modal) {
							this.page.modal.closeModal();
						}
					}, 100);
					if (authorized) {
						Toast.makeText("Connected")
							.show();
						if (this.redirect) {
							this.zone.run(() => this.router.navigateByUrl(
								this.auth.redirectUrl ? this.auth.redirectUrl : "/library/queue",
								{ clearHistory: true },
							));
						}
					} else {
						Toast.makeText("Failed to connect", "long")
							.show();
					}
				});
		}, 250);
	}
}
