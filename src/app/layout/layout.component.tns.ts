import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { NavigationEnd } from "@angular/router";
import { RouterExtensions } from "@nativescript/angular";
import { EventData, LoadEventData, TextField } from "@nativescript/core";


@Component({
	selector: "app-layout",
	templateUrl: "./layout.component.html",
	styleUrls: ["./layout.component.scss"]
})
export class LayoutComponent implements OnInit {
	public title: string;
	public field: TextField;
	public searchVisible = false;

	constructor(
		protected router: RouterExtensions,
	) { }

	ngOnInit(): void {
		this.setTitle();
		this.router.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
				this.setTitle();
			}
		});
	}

	protected setTitle(): void {
		switch (this.router.router.url) {
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
			if (this.router.router.url.startsWith("/playlists")) {
				this.title = "Playlists";
			} else if (this.router.router.url.startsWith("/browse")) {
				this.title = "Browse";
			}
		}
	}

	setSearchField(args: LoadEventData): void {
		this.field = <TextField> args.object;
	}

	toggleSearch(): void {
		this.searchVisible = !this.searchVisible;
		if (this.searchVisible) {
			setTimeout(() => this.field?.focus(), 100);
		}
	}

	search(args: EventData): void {
		const input = <TextField> args.object;
		this.router.navigate(["/search"], { queryParams: { q: input.text.toLowerCase() } });
		this.searchVisible = false;
	}
}
