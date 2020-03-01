import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as appSettings from "tns-core-modules/application-settings";

import { ArtBaseService } from "@src/app/shared/services/art.service.base";


@Injectable({
	providedIn: "root",
})
export class ArtService extends ArtBaseService {
	constructor(http: HttpClient) {
		super(http, appSettings.getString, appSettings.setString);
	}
}
