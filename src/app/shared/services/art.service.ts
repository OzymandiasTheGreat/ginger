import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { ArtBaseService } from "@src/app/shared/services/art.service.base";


@Injectable({
	providedIn: "root"
})
export class ArtService extends ArtBaseService {
	constructor(http: HttpClient) {
		super(
			http,
			window.localStorage.getItem.bind(window.localStorage),
			window.localStorage.setItem.bind(window.localStorage),
			);
	}
}
