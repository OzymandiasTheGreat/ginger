import { Component, OnInit, NgZone } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApplicationSettings } from "@nativescript/core";

import { PlaylistBaseComponent } from "@src/app/playlist/playlist.component.base";
import { CURRENT_MOPIDY } from "@src/app/types/constants";
import { MpcService } from "@src/app/services/mpc.service";


@Component({
	selector: "app-playlist",
	templateUrl: "./playlist.component.html",
	styleUrls: ["./playlist.component.scss"]
})
export class PlaylistComponent extends PlaylistBaseComponent implements OnInit {
	constructor(
		protected zone: NgZone,
		protected route: ActivatedRoute,
		protected mpc: MpcService,
	) {
		super(zone, route, mpc);
	}

	ngOnInit(): void {
		this.mopidy = ApplicationSettings.getBoolean(CURRENT_MOPIDY);
		super.ngOnInit();
	}
}
