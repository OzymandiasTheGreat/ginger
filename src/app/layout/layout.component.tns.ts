import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { RadSideDrawerComponent } from "nativescript-ui-sidedrawer/angular";

import { Layout, ISideLink } from "@src/app/layout/layout.component.base";


@Component({
	selector: "app-layout",
	templateUrl: "./layout.component.html",
	styleUrls: ["./layout.component.scss"]
})
export class LayoutComponent extends Layout implements AfterViewInit {
	@ViewChild("sidebar", { static: true }) public sidebar: RadSideDrawerComponent;

	constructor() {
		super();
	}

	public ngAfterViewInit() {}

	public templateSelector(item: ISideLink, index: number, items: any) {
		return item.type;
	}
}
