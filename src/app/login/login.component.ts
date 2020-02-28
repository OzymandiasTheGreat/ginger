import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { ConnectionComponent } from "@src/app/shared/components/connection/connection.component";

@Component({
	selector: "app-login",
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
	public address = "";
	public password = "";

	constructor(
		private route: ActivatedRoute,
		private mpd: MpdService,
		public connection: MatDialog,
	) {
		this.address = window.localStorage.getItem("MPD_ADDRESS") || "";
		this.password = window.localStorage.getItem("MPD_PASSWORD") || "";
	}

	public ngOnInit() {
		if (this.route.snapshot.queryParamMap.get("redirect") === "true" && this.address.length > 0) {
			this.openConnection();
		}
	}

	public openConnection(): void {
		const dialogRef = this.connection.open(ConnectionComponent, {
			width: "25%",
			height: "35vh",
			disableClose: true,
		});

		window.localStorage.setItem("MPD_ADDRESS", this.address);
		window.localStorage.setItem("MPD_PASSWORD", this.password);
		this.connect();

		const timeout = window.setTimeout(() => {
			window.clearTimeout(timeout);
			dialogRef.close();
		}, 3000);
	}

	public connect(): void {
		this.mpd.connect(this.address, this.password);
	}
}
