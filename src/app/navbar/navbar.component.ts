import { Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { Navbar } from "@src/app/navbar/navbar.component.base";
import { SearchService } from "@src/app/shared/services/search.service";


@Component({
	selector: "app-navbar",
	templateUrl: "./navbar.component.html",
	styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent extends Navbar {
	constructor(
		router: Router,
		route: ActivatedRoute,
		searchService: SearchService,
	) {
		super(router, route, searchService);
	}

	public onCrumbSelected(crumb: string) {
		const url = this.breadcrumbLinks[this.breadcrumbs.indexOf(crumb)];
		this.router.navigateByUrl(url);
	}
}
