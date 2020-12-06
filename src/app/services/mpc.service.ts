import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import Mopidy from "mopidy";
import { MPC } from "mpc-js-web";


@Injectable({
	providedIn: "root"
})
export class MpcService {
	public socket: Mopidy | MPC;
	public connection: Observable<boolean>;
	private _connection: BehaviorSubject<boolean>;

	constructor() {
		this._connection = new BehaviorSubject<boolean>(false);
		this.connection = this._connection.asObservable();
	}

	public connect(address: string, password: string, mopidy: boolean): void {
		if (mopidy) {
			this.socket = new Mopidy({
				webSocketUrl: address,
				autoConnect: false,
			});
			this.socket.on("state:online", () => this._connection.next(true));
			this.socket.on("state:offline", () => this._connection.next(false));
			this.socket.connect();
		} else {
			this.socket = new MPC();
			this.socket.on("ready", () => this._connection.next(true));
			this.socket.on("socket-end", () => this._connection.next(false));
			this.socket.connectWebSocket(address);
			if (password) {
				this.socket.connection.password(password);
			}
		}
	}
}
