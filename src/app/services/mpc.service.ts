import { Injectable, EventEmitter } from "@angular/core";
import Mopidy from "mopidy";
import { MPC } from "mpc-js-web";


@Injectable({
	providedIn: "root"
})
export class MpcService {
	public socket: Mopidy | MPC;
	public connection: EventEmitter<boolean>;

	constructor() {
		this.connection = new EventEmitter(false);
	}

	public connect(address: string, password: string, mopidy: boolean): void {
		if (mopidy) {
			this.socket = new Mopidy({
				webSocketUrl: address,
				autoConnect: false,
			});
			this.socket.on("state:online", () => this.connection.emit(true));
			this.socket.on("state:offline", () => this.connection.emit(false));
			this.socket.connect();
		} else {
			this.socket = new MPC();
			this.socket.on("ready", () => this.connection.emit(true));
			this.socket.on("socket-end", () => this.connection.emit(false));
			this.socket.connectWebSocket(address);
			if (password) {
				this.socket.connection.password(password);
			}
		}
	}
}
