import { Component } from "@angular/core";

import { PlatformService } from "@src/app/shared/services/platform.service";


@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
})

export class AppComponent {
	constructor(private platform: PlatformService) {}
}
