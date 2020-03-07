import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from "@angular/core";
import { Event as RouterEvent, NavigationEnd } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { RadSideDrawerComponent } from "nativescript-ui-sidedrawer/angular";

import { Layout } from "@src/app/layout/layout.component.base";


@Component({
	selector: "app-layout",
	templateUrl: "./layout.component.html",
	styleUrls: ["./layout.component.scss"]
})
export class LayoutComponent extends Layout implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild("sidebar", { static: true }) public sidebar: ElementRef<RadSideDrawerComponent>;
	public openHeader = [];

	private ngUnsubscribe: Subject<void>;

	constructor(private router: RouterExtensions) {
		super();
		this.ngUnsubscribe = new Subject<void>();
	}

	public ngOnInit() {
		this.router.router.events.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((event: RouterEvent) => {
				if (event instanceof NavigationEnd) {
					this.openHeader = [this.links.findIndex(({ items }) => items.some((link) => this.router.router.isActive(link.path, false)))];
				}
			});
	}

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public ngAfterViewInit() {}
}
