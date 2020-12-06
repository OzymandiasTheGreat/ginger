import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { MatInput } from "@angular/material/input";


@Component({
	selector: "app-layout",
	templateUrl: "./layout.component.html",
	styleUrls: ["./layout.component.scss"]
})
export class LayoutComponent implements OnInit {
	@ViewChild("field") public field: ElementRef<MatInput>;
	public title: string;
	public searchVisible = false;

	constructor(
		protected router: Router,
	) { }

	ngOnInit(): void {
		this.setTitle();
		this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				this.setTitle();
			}
		});
	}

	protected setTitle(): void {
		switch (this.router.url) {
			case "/connect":
				this.title = "Connect";
				break;
			case "/queue":
				this.title = "Queue";
				break;
			case "/browse":
				this.title = "Browse";
				break;
			case "/playlists":
				this.title = "Playlists";
				break;
			default:
				this.title = null;
		}
		if (this.title === null) {
			if (this.router.url.startsWith("/playlists")) {
				this.title = "Playlists";
			} else if (this.router.url.startsWith("/browse")) {
				this.title = "Browse";
			}
		}
	}

	toggleSearch(): void {
		this.searchVisible = !this.searchVisible;
		if (this.searchVisible) {
			setTimeout(() => this.field.nativeElement.focus(), 100);
		}
	}

	search(args: MatInput): void {
		this.router.navigate(["/search"], { queryParams: { q: args.value.toLowerCase() } });
		this.searchVisible = false;
	}
}
