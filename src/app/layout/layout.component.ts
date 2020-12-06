import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { MatInput } from "@angular/material/input";


@Component({
	selector: "app-layout",
	templateUrl: "./layout.component.html",
	styleUrls: ["./layout.component.scss"]
})
export class LayoutComponent implements OnInit {
	@ViewChild("field") public field: ElementRef<MatInput>;
	public searchVisible = false;

	constructor(
		protected router: Router,
	) { }

	ngOnInit(): void { }

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
