import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";

import { MpdService } from "@src/app/shared/services/mpd.service";


@Injectable({
	providedIn: "root"
})
export class AuthService {
	private authSource: BehaviorSubject<boolean>;

	public redirectUrl: string;
	public authorized: Observable<boolean>;

	constructor(private mpd: MpdService) {
		this.authSource = new BehaviorSubject(false);
		this.authorized = this.authSource.asObservable();
		this.mpd.connected.subscribe(this.authSource);
	}
}
