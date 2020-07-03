import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";

import { MPClientService } from "@src/app/shared/services/mpclient.service";


@Injectable({
	providedIn: "root"
})
export class AuthService {
	private authSource: BehaviorSubject<boolean>;

	public redirectUrl: string;
	public authorized: Observable<boolean>;

	constructor(private mpc: MPClientService) {
		this.authSource = new BehaviorSubject(false);
		this.authorized = this.authSource.asObservable();
		this.mpc.connected.subscribe(this.authSource);
	}
}
