import { Injectable, NgZone } from "@angular/core";
import { ApplicationSettings } from "@nativescript/core";

import { PlaylistBaseService } from "@src/app/services/playlist.service.base";
import { CURRENT_MOPIDY } from "@src/app/types/constants";
import { MpcService } from "@src/app/services/mpc.service";


@Injectable({
	providedIn: "root"
})
export class PlaylistService extends PlaylistBaseService {

	constructor(
		protected zone: NgZone,
		protected mpc: MpcService,
	) {
		super(zone, mpc);
		this.mopidy = ApplicationSettings.getBoolean(CURRENT_MOPIDY);
		this.load();
	}
}
