import { Component, OnInit, NgZone } from "@angular/core";

import { QueueBase } from "@src/app/queue/queue.component.base";
import { CURRENT_MOPIDY } from "@src/app/types/constants";
import { MpcService } from "@src/app/services/mpc.service";
import { ArtService } from "@src/app/services/art.service";


@Component({
	selector: "app-queue",
	templateUrl: "./queue.component.html",
	styleUrls: ["./queue.component.scss"],
})
export class QueueComponent extends QueueBase implements OnInit {
	public mopidy: boolean;

	constructor(
		protected zone: NgZone,
		public mpc: MpcService,
		public art: ArtService,
	) {
		super(zone, mpc, art);
	}

	ngOnInit(): void {
		this.mopidy = JSON.parse(window.localStorage.getItem(CURRENT_MOPIDY));
		this.load();
	}
}
