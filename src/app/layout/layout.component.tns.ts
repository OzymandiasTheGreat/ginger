import { Component, OnInit } from "@angular/core";


@Component({
	selector: "app-layout",
	templateUrl: "./layout.component.html",
	styleUrls: ["./layout.component.scss"]
})
export class LayoutComponent implements OnInit {
	public searchVisible = false;

	constructor() { }

	ngOnInit(): void { }

	toggleSearch(): void {
		this.searchVisible = !this.searchVisible;
	}
}
