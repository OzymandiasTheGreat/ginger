import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";

import { Navbar } from "@src/app/navbar/navbar.component.base";
import { SearchService } from "@src/app/shared/services/search.service";


@Component({
	selector: "app-navbar",
	templateUrl: "./navbar.component.html",
	styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent extends Navbar {
	public searchShown = false;

	constructor(
		router: RouterExtensions,
		route: ActivatedRoute,
		searchService: SearchService,
	) {
		super(router, route, searchService);
	}

	public toggleSearch() {
		this.searchShown = !this.searchShown;
	}
}
