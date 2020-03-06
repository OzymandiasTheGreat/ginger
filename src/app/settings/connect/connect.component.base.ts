import { OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subject } from "rxjs";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { AuthService } from "@src/app/shared/services/auth.service";


export class Connect implements OnDestroy {
	public address = "";
	public password = "";
	public redirect: boolean;

	protected ngUnsubscribe: Subject<void>;

	constructor(
		protected route: ActivatedRoute,
		protected mpc: MpdService,
		protected auth: AuthService,
	) {
		this.ngUnsubscribe = new Subject<void>();
		this.redirect = this.route.snapshot.queryParamMap.get("redirect") === "true";
	}

	public connect(): Observable<boolean> {
		this.mpc.connect(this.address.trim(), this.password);
		return this.auth.authorized;
	}

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
