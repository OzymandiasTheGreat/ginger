import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { CURRENT_CONNECTION_ADDRESS, CURRENT_CONNECTION_PASSWORD, CURRENT_MOPIDY, CONNECTION_HISTORY } from "@src/app/types/constants";
import { MpcService } from "@src/app/services/mpc.service";
import { PlatformService } from "@src/app/services/platform.service";


@Component({
	selector: "app-connection",
	templateUrl: "./connection.component.html",
	styleUrls: ["./connection.component.scss"]
})
export class ConnectionComponent implements OnInit {
	public history: Array<{ address: string, password: string, mopidy: boolean }>;
	public mopidy: boolean;
	public address: string;
	public password: string;

	constructor(
		protected route: ActivatedRoute,
		public mpc: MpcService,
		protected platform: PlatformService,
	) { }

	ngOnInit(): void {
		this.history = JSON.parse(window.localStorage.getItem(CONNECTION_HISTORY) || "[]");
		this.address = window.localStorage.getItem(CURRENT_CONNECTION_ADDRESS) || "";
		this.password = window.localStorage.getItem(CURRENT_CONNECTION_PASSWORD) || "";
		this.mopidy = JSON.parse(window.localStorage.getItem(CURRENT_MOPIDY) || "false");
		if (this.route.snapshot.paramMap.get("reconnect")) {
			this.connect();
		}
	}

	connect(): void {
		const index = this.history.findIndex(({ address }) => address === this.address);
		const entry: { address: string, password: string, mopidy: boolean } = this.history[index] || <any> {};
		if (entry.address === undefined) {
			entry.address = this.address;
		}
		entry.password = this.password;
		entry.mopidy = this.mopidy;
		console.log(index);
		if (index > -1) {
			this.history.splice(index, 1);
		}
		if (entry.address) {
			this.history.unshift(entry);
			window.localStorage.setItem(CONNECTION_HISTORY, JSON.stringify(this.history));
			window.localStorage.setItem(CURRENT_CONNECTION_ADDRESS, this.address);
			window.localStorage.setItem(CURRENT_CONNECTION_PASSWORD, this.password);
			window.localStorage.setItem(CURRENT_MOPIDY, JSON.stringify(this.mopidy));
			this.mpc.connect(this.address, this.password, this.mopidy);
		}
		this.platform.setup();
	}

	fill(address: string, password: string, mopidy: boolean): void {
		this.address = address;
		this.password = password;
		this.mopidy = mopidy;
	}
}
