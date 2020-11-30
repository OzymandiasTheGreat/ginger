import { Component, OnInit, NgZone } from "@angular/core";
import { ApplicationSettings } from "@nativescript/core";

import { CURRENT_MOPIDY } from "@src/app/types/constants";
import { MpcService } from "@src/app/services/mpc.service";
import { ArtService } from "@src/app/services/art.service";
import { QueueBase } from "@src/app/queue/queue.component.base";


@Component({
	selector: "app-queue",
	templateUrl: "./queue.component.html",
	styleUrls: ["./queue.component.scss"]
})
export class QueueComponent extends QueueBase implements OnInit {
	constructor(
		protected zone: NgZone,
		public mpc: MpcService,
		public art: ArtService,
	) {
		super(zone, mpc, art);
	}

	ngOnInit(): void {
		this.mopidy = ApplicationSettings.getBoolean(CURRENT_MOPIDY);
		this.load();
	}
}
