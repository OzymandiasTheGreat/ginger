import { Injectable } from "@angular/core";
import { CanLoad, Route, UrlSegment, Router } from "@angular/router";
import { HttpUrlEncodingCodec } from "@angular/common/http";
import { Observable, Subject } from "rxjs";

import { AuthService } from "@src/app/shared/services/auth.service";


@Injectable({
	providedIn: "root"
})
export class AuthGuard implements CanLoad {
	private codec: HttpUrlEncodingCodec;

	constructor(
		private auth: AuthService,
		private router: Router,
	) {
		this.codec = new HttpUrlEncodingCodec();
	}

	public canLoad(
		route: Route,
		segments: UrlSegment[],
	): Observable<boolean> | Promise<boolean> | boolean {
		const subject = new Subject<boolean>();
		this.auth.authorized.subscribe((authorized) => {
			// tslint:disable-next-line:newline-per-chained-call
			const url = `/${segments.map((s) => this.codec.encodeKey(s.path).replace(/\(/, "%28").replace(/\)/, "%29")).join("/")}`;
			if (!authorized) {
				this.auth.redirectUrl = url;
				this.router.navigate(["/connect"], { queryParams: { redirect: true } });
			}
			subject.next(authorized);
			subject.complete();
		});
		return subject;
	}
}
