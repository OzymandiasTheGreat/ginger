import { Injectable } from "@angular/core";
import { ApplicationSettings } from "@nativescript/core";

import { ArtBase } from "@src/app/services/art.service.base";


@Injectable({
	providedIn: "root"
})
export class ArtService extends ArtBase {

	constructor() {
		super(
			ApplicationSettings.getString,
			ApplicationSettings.setString,
		);
	}
}
