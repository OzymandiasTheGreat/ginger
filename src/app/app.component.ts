import { Component, AfterViewInit, OnDestroy, ViewChild, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { MediaMatcher } from "@angular/cdk/layout";
import { MatIconRegistry } from "@angular/material/icon";
import { MatDrawer } from "@angular/material/sidenav";

import { MpdService } from "@src/app/shared/services/mpd.service";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent implements AfterViewInit, OnDestroy {
	private mobileQueryListener: () => void;

	@ViewChild("sidebar", { static: true }) public sidebar: MatDrawer;
	public title = "ginger";
	public mobileQuery: MediaQueryList;
	public navLinks = [
		{
			title: "Library",
			icon: "mdi-library-music",
			links: [
				{ title: "Now Playing", icon: "mdi-play-box", path: "/library/queue" },
				{ title: "Playlists", icon: "mdi-playlist-music", path: "/library/playlists" },
				{ title: "Artists", icon: "mdi-artist", path: "/library/artists" },
				{ title: "Albums", icon: "mdi-album", path: "/library/albums" },
				{ title: "Genres", icon: "mdi-music-circle", path: "/library/genres" },
				{ title: "File System", icon: "mdi-file-music", path: "/library/files" },
			],
		},
		{
			title: "Preferences",
			icon: "mdi-cogs",
			links: [
				{ title: "Connection", icon: "mdi-web", path: "/connect" },
			],
		},
	];

	constructor(
		private changeDetectorRef: ChangeDetectorRef,
		private router: Router,
		private registry: MatIconRegistry,
		private media: MediaMatcher,
		private mpd: MpdService,
	) {
		this.mobileQuery = media.matchMedia("(max-width: 768px)");
		this.mobileQueryListener = () => changeDetectorRef.detectChanges();
		this.mobileQuery.addEventListener("change", this.mobileQueryListener);

		registry.setDefaultFontSetClass("mdi");
	}

	public ngAfterViewInit() {}

	public ngOnDestroy() {
		this.mobileQuery.removeEventListener("change", this.mobileQueryListener);
	}

	public isExpanded(links: Array<{title: string, path: string}>) {
		return links.some((link) => this.router.isActive(link.path, false));
	}
}
