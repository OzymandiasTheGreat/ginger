import { OnInit, OnDestroy, Output, EventEmitter } from "@angular/core";
import { Router, ActivatedRoute, Event as RouterEvent, NavigationEnd } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { flattenUrl } from "@src/app/shared/functions/route";
import { SearchService } from "@src/app/shared/services/search.service";


export class Navbar implements OnInit, OnDestroy {
	@Output() public toggleSidebar = new EventEmitter<void>();
	public breadcrumbs: string[] = [];
	public breadcrumbLinks: string[] = [];
	public query: string;

	protected ngUnsubscribe: Subject<void>;

	constructor(
		protected router: Router | RouterExtensions,
		protected route: ActivatedRoute,
		protected searchService: SearchService,
	) {
		this.ngUnsubscribe = new Subject<void>();
	}

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public ngOnInit() {
		((<Router> this.router).events || (<RouterExtensions> this.router).router.events)
		.pipe(takeUntil(this.ngUnsubscribe))
		.subscribe((event: RouterEvent) => {
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

	public onQuery(query: string) {
		this.searchService.updateQuery(query);
	}

	public onSearch(query: string) {
		this.router.navigate(["/library/search"], { queryParams: { q: query } });
		this.query = "";
		return false;
	}
}
