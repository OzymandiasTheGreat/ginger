import { Injectable } from "@angular/core";
import * as appSettings from "tns-core-modules/application-settings";

import { ArtBaseService } from "@src/app/shared/services/art.service.base";


@Injectable({
	providedIn: "root",
})
export class ArtService extends ArtBaseService {
	constructor() {
		super(appSettings.getString, appSettings.setString);
	}
}
