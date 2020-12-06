import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "@nativescript/angular";
import { EventData, TextField } from "@nativescript/core";


@Component({
	selector: "app-layout",
	templateUrl: "./layout.component.html",
	styleUrls: ["./layout.component.scss"]
})
export class LayoutComponent implements OnInit {
	public searchVisible = false;

	constructor(
		protected router: RouterExtensions,
	) { }

	ngOnInit(): void { }

	toggleSearch(): void {
		this.searchVisible = !this.searchVisible;
	}

	search(args: EventData): void {
		const input = <TextField> args.object;
		this.router.navigate(["/search"], { queryParams: { q: input.text.toLowerCase() } });
	}
}
