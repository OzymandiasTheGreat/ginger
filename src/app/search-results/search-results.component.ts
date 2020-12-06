import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { SearchResultsBase } from "@src/app/search-results/search-results.component.base";
import { CURRENT_MOPIDY } from "@src/app/types/constants";
import { MpcService } from "@src/app/services/mpc.service";
import { ArtService } from "@src/app/services/art.service";


@Component({
	selector: "app-search-results",
	templateUrl: "./search-results.component.html",
	styleUrls: ["./search-results.component.scss"]
})
export class SearchResultsComponent extends SearchResultsBase implements OnInit {

	constructor(
		protected route: ActivatedRoute,
		protected mpc: MpcService,
		protected art: ArtService,
	) {
		super(route, mpc, art);
	}

	ngOnInit(): void {
		this.mopidy = JSON.parse(window.localStorage.getItem(CURRENT_MOPIDY));
		this.init();
	}
}
