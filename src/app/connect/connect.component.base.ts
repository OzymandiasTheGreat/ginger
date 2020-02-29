import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";

import { MpdService } from "@src/app/shared/services/mpd.service";


export class Connect {
	public address = "";
	public password = "";

	constructor(
		protected route: ActivatedRoute,
		protected mpc: MpdService,
	) {}

	public connect(): Observable<boolean> {
		return this.mpc.connect(this.address, this.password);
	}
}
