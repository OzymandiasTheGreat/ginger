import { Component, OnInit, NgZone } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

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
		protected router: Router,
	) {
		super(zone, route, mpc, art);
	}

	ngOnInit(): void {
		this.mopidy = JSON.parse(window.localStorage.getItem(CURRENT_MOPIDY));
		this.init();
	}

	navigate(uri: string): void {
		this.router.navigate(["/browse"], { queryParams: { uri: encodeURIComponent(uri) } });
	}
}
