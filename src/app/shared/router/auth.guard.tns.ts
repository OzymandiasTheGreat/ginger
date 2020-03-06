import { Injectable } from "@angular/core";
import { CanLoad, Route, UrlSegment } from "@angular/router";
import { HttpUrlEncodingCodec } from "@angular/common/http";
import { Observable } from "rxjs";
import { map, first } from "rxjs/operators";
import { RouterExtensions } from "nativescript-angular/router";

import { AuthService } from "@src/app/shared/services/auth.service";


@Injectable({
	providedIn: "root"
})
export class AuthGuard implements CanLoad {
	private codec: HttpUrlEncodingCodec;

	constructor(
		private auth: AuthService,
		private router: RouterExtensions,
	) {
		this.codec = new HttpUrlEncodingCodec();
	}

	public canLoad(
		route: Route,
		segments: UrlSegment[],
	): Observable<boolean> | Promise<boolean> | boolean {
		return this.auth.authorized.pipe(
			map((authorized) => {
				// tslint:disable-next-line:newline-per-chained-call
				const url = this.codec.encodeKey(`/${segments.map((s) => s.path).join("/")}`).replace(/\(/, "%28").replace(/\)/, "%29");
				if (!authorized) {
					this.auth.redirectUrl = url;
					this.router.navigate(["/settings/connect"], {
						queryParams: { redirect: true },
						clearHistory: true,
						skipLocationChange: true,
					});
				}
				return authorized;
			}),
			first(),
		);
	}
}
