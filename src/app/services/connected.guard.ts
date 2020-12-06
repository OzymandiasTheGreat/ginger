import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";

import { MpcService } from "@src/app/services/mpc.service";


@Injectable({
	providedIn: "root"
})
export class ConnectedGuard implements CanActivate {
	constructor(private mpc: MpcService) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return this.mpc.connection.pipe(first());
	}
}
