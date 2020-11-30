import { Injectable } from "@angular/core";

import { ArtBase } from "@src/app/services/art.service.base";


@Injectable({
	providedIn: "root"
})
export class ArtService extends ArtBase {

	constructor() {
		super(
			window.localStorage.getItem.bind(window.localStorage),
			window.localStorage.setItem.bind(window.localStorage),
		);
	}
}
