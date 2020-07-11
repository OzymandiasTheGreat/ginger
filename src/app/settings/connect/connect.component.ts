import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { skip } from "rxjs/operators";

import { Connect } from "@src/app/settings/connect/connect.component.base";
import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { AuthService } from "@src/app/shared/services/auth.service";
import { ConnectionComponent } from "@src/app/shared/components/connection/connection.component";


@Component({
	selector: "app-connect",
	templateUrl: "./connect.component.html",
	styleUrls: ["./connect.component.scss"],
})
export class ConnectComponent extends Connect implements OnInit {
	public mopidy = false;
	public address = "";
	public password = "";

	constructor(
		route: ActivatedRoute,
		mpc: MPClientService,
		auth: AuthService,
		public connection: MatDialog,
	) {
		super(route, mpc, auth);
		this.address = window.localStorage.getItem("MPD_ADDRESS") || "";
		this.password = window.localStorage.getItem("MPD_PASSWORD") || "";
		this.mopidy = window.localStorage.getItem("MOPIDY") === "true" || false;
	}

	public ngOnInit() {
		if (this.route.snapshot.queryParamMap.get("redirect") === "true" && this.address.length > 0) {
			this.openConnection();
		}
	}

	public openConnection() {
		const dialogRef = this.connection.open(ConnectionComponent, {
			width: "25%",
			height: "35vh",
			disableClose: true,
		});

		window.localStorage.setItem("MPD_ADDRESS", this.address);
		window.localStorage.setItem("MPD_PASSWORD", this.password);
		window.localStorage.setItem("MOPIDY", String(this.mopidy));
		this.connect()
			.subscribe((success) => {
				if (success) {
					dialogRef.close();
				}
			});
		return false;
	}
}
