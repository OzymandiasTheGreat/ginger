import { Component, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import * as settings from "tns-core-modules/application-settings";

import { AuthService } from "@src/app/shared/services/auth.service";
import { PlatformService } from "@src/app/shared/services/platform.service";


@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
})

export class AppComponent implements OnDestroy {
	private ngUnsubscribe: Subject<void>;

	constructor(
		private auth: AuthService,
		private platformService: PlatformService,
	) {
		this.ngUnsubscribe = new Subject<void>();
		this.auth.authorized
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((authorized) => {
				if (authorized) {
					this.platformService.setCredentials(
						settings.getString("MPD_ADDRESS", null),
						settings.getString("MPD_PASSWORD", null),
						settings.getBoolean("MOPIDY", false),
					);
				}
			});
	}

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
