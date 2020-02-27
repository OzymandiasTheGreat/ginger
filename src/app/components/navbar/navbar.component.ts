import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";

import { flattenUrl } from "../../shared/functions/route";
import { SearchService } from "../../shared/services/search.service";


@Component({
	selector: "app-navbar",
	templateUrl: "./navbar.component.html",
	styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit {
	@Output() public toggleSidebar = new EventEmitter<Event>();
	public breadcrumbs: string[] = [];
	public breadcrumbLinks: string[] = [];
	public query: string;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private searchService: SearchService,
	) {}

	public ngOnInit() {
		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				this.breadcrumbs = flattenUrl(this.route.snapshot.children);
				this.breadcrumbLinks = [];

				const segments = [...this.breadcrumbs];
				while (segments.length > 0) {
					this.breadcrumbLinks.push(`/${segments.join("/")}`);
					segments.pop();
				}
				this.breadcrumbLinks.reverse();
			}
		});
	}

	public onCrumbSelected(crumb: string) {
		const url = this.breadcrumbLinks[this.breadcrumbs.indexOf(crumb)];
		this.router.navigateByUrl(url);
	}

	public onQuery(query: string) {
		this.searchService.updateQuery(query);
	}

	public onSearch(query: string) {
		this.router.navigate(["/library/search"], { queryParams: { q: query } });
		this.query = "";
		return false;
	}
}
