import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { PlaylistsBaseComponent } from "@src/app/playlists/playlists.component.base";
import { CURRENT_MOPIDY } from "@src/app/types/constants";
import { PlaylistService } from "@src/app/services/playlist.service";
import { MpcService } from "@src/app/services/mpc.service";


@Component({
	selector: "app-playlists",
	templateUrl: "./playlists.component.html",
	styleUrls: ["./playlists.component.scss"]
})
export class PlaylistsComponent extends PlaylistsBaseComponent implements OnInit {
	constructor(
		public pls: PlaylistService,
		public mpc: MpcService,
		protected router: Router,
	) {
		super(pls, mpc);
	}

	ngOnInit(): void {
		super.ngOnInit();
		this.mopidy = JSON.parse(window.localStorage.getItem(CURRENT_MOPIDY));
	}

	navigate(uri: string): void {
		this.router.navigate(["/playlists", encodeURIComponent(uri)]);
	}
}
