import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationEnd } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { takeUntil } from "rxjs/operators";
import { SelectedIndexChangedEventData } from "nativescript-drop-down";

import { Navbar } from "@src/app/navbar/navbar.component.base";
import { SearchService } from "@src/app/shared/services/search.service";


@Component({
	selector: "app-navbar",
	templateUrl: "./navbar.component.html",
	styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent extends Navbar implements OnInit {
	public crumbsDisplay: string[] = [];
	public searchShown = false;

	constructor(
		router: RouterExtensions,
		route: ActivatedRoute,
		searchService: SearchService,
	) {
		super(router, route, searchService);
	}

	public ngOnInit() {
		super.ngOnInit();
		(<RouterExtensions> this.router).router.events
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((event) => {
				if (event instanceof NavigationEnd) {
					this.crumbsDisplay = this.breadcrumbs.map(
						(crumb) => {
							if (crumb === "queue") {
								return "Now Playing";
							}
							// tslint:disable-next-line:newline-per-chained-call
							return `${crumb.slice(0, 1).toUpperCase()}${crumb.slice(1)}`;
						}
					);
				}
			});
	}

	public onBreadcrumbSelected(data: SelectedIndexChangedEventData) {
		const url = this.breadcrumbLinks[data.newIndex];
		this.router.navigateByUrl(url);
	}

	public toggleSearch() {
		this.searchShown = !this.searchShown;
	}
}
