import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MatDialogRef } from "@angular/material/dialog";

import { AuthService } from "../../services/auth.service";


@Component({
	selector: "app-connection",
	templateUrl: "./connection.component.html",
	styleUrls: ["./connection.component.scss"]
})
export class ConnectionComponent implements OnInit {
	private redirect: boolean;

	constructor(
		private router: Router,
		private route: ActivatedRoute,
		private auth: AuthService,
		public dialogRef: MatDialogRef<ConnectionComponent>,
	) {}

	public ngOnInit() {
		this.redirect = this.route.snapshot.queryParamMap.get("redirect") === "true";
		this.auth.authorized.subscribe((authorized) => {
			if (authorized) {
				setTimeout(() => {
					if (this.redirect) {
						this.router.navigateByUrl(this.auth.redirectUrl ? this.auth.redirectUrl : "/library/queue");
					}
					this.dialogRef.close();
				}, 250);
			}
		});
	}
}
