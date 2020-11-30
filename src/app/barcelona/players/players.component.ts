import { Component, OnInit } from "@angular/core";
import Mopidy from "mopidy";
import { MPC } from "mpc-js-web";

import { Player } from "@src/app/barcelona/player.model";
import { PlayerService } from "@src/app/barcelona/player.service";

@Component({
	selector: "app-players",
	templateUrl: "./players.component.html",
})
export class PlayersComponent implements OnInit {
	mpc: MPC | Mopidy;
	players: Player[];

	constructor(private playerService: PlayerService) {
		// this.mpc = new MPC();
		this.mpc = new Mopidy({
			webSocketUrl: "ws://192.168.1.102:6680/mopidy/ws/",
			autoConnect: false,
		});
	}

	ngOnInit(): void {
		// this.mpc.connectWebSocket("ws://192.168.1.102:8000");
		this.mpc.connect();
		this.players = this.playerService.getPlayers();
	}

	stop(): void {
		this.mpc.playback.stop();
	}
}
