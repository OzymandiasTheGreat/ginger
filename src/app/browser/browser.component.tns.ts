import { Component, OnInit, NgZone } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "@nativescript/angular";
import { ApplicationSettings } from "@nativescript/core";

import { BrowserBase } from "@src/app/browser/browser.component.base";
import { CURRENT_MOPIDY } from "@src/app/types/constants";
import { MpcService } from "@src/app/services/mpc.service";
import { ArtService } from "@src/app/services/art.service";


@Component({
	selector: "app-browser",
	templateUrl: "./browser.component.html",
	styleUrls: ["./browser.component.scss"]
})
export class BrowserComponent extends BrowserBase implements OnInit {

	constructor(
		protected zone: NgZone,
		protected route: ActivatedRoute,
		protected mpc: MpcService,
		protected art: ArtService,
		protected router: RouterExtensions,
	) {
		super(zone, route, mpc, art);
	}

	ngOnInit(): void {
		this.mopidy = ApplicationSettings.getBoolean(CURRENT_MOPIDY);
		this.init();
	}

	navigate(uri: string): void {
		this.router.navigate(["/browse"], { queryParams: { uri: encodeURIComponent(uri) } });
	}
}
