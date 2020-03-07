import { Component, OnDestroy, ViewChild, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { MediaMatcher } from "@angular/cdk/layout";
import { MatIconRegistry } from "@angular/material/icon";
import { MatDrawer } from "@angular/material/sidenav";

import { Layout } from "@src/app/layout/layout.component.base";
import { MpdService } from "@src/app/shared/services/mpd.service";


@Component({
	selector: "app-layout",
	templateUrl: "./layout.component.html",
	styleUrls: ["./layout.component.scss"]
})
export class LayoutComponent extends Layout implements OnDestroy {
	private mobileQueryListener: () => void;

	@ViewChild("sidebar", { static: true }) public sidebar: MatDrawer;
	public title = "ginger";
	public mobileQuery: MediaQueryList;

	constructor(
		private router: Router,
		private registry: MatIconRegistry,
		private cdRef: ChangeDetectorRef,
		private media: MediaMatcher,
		private mpc: MpdService,
	) {
		super();
		this.mobileQuery = media.matchMedia("(max-width: 768px)");
		this.mobileQueryListener = () => cdRef.detectChanges();
		this.mobileQuery.addEventListener("change", this.mobileQueryListener);

		registry.setDefaultFontSetClass("mdi");
	}

	public ngOnDestroy() {
		this.mobileQuery.removeEventListener("change", this.mobileQueryListener);
	}

	public isExpanded(links: Array<{ title: string, icon: string, iconClass: string, path: string }>): boolean {
		return links.some((link) => this.router.isActive(link.path, false));
	}
}
