import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { EventData, LoadEventData, TextField } from "@nativescript/core";


@Component({
	selector: "app-layout",
	templateUrl: "./layout.component.html",
	styleUrls: ["./layout.component.scss"]
})
export class LayoutComponent implements OnInit {
	public field: TextField;
	public searchVisible = false;

	constructor(
		protected router: RouterExtensions,
	) { }

	ngOnInit(): void { }

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
