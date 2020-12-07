import { Component } from "@angular/core";

import { PlatformService } from "@src/app/services/platform.service";


@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	constructor(protected platform: PlatformService) { }
}
