import { Injectable } from "@angular/core";

import { ArtBaseService } from "@src/app/shared/services/art.service.base";


@Injectable({
	providedIn: "root"
})
export class ArtService extends ArtBaseService {
	constructor() {
		super(
			window.localStorage.getItem.bind(window.localStorage),
			window.localStorage.setItem.bind(window.localStorage),
			);
	}
}
