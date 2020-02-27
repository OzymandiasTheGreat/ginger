import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, from, defer, fromEvent } from "rxjs";
import { mergeAll, retry, tap } from "rxjs/operators";

import { MPC, PlaylistItem, Status, StoredPlaylist, Song, Playlist, Directory } from "mpc-js-web";


export class CurrentPlaylist {
	private MPD: MpdService;
	private MPC: MPC;

	constructor(mpd: MpdService, mpc: MPC) {
		this.MPD = mpd;
		this.MPC = mpc;
	}

	public get playlist(): Observable<PlaylistItem | undefined> {
		return defer(() => this.MPC.currentPlaylist.playlistInfo())
			.pipe(
				retry(3),
				mergeAll(),
			);
	}

	public remove(id: number): Observable<void> {
		return from(this.MPC.currentPlaylist.deleteId(id));
	}

	public clear(): Observable<void> {
		return from(this.MPC.currentPlaylist.clear());
	}

	public add(song: string, single = true): Observable<number | void> {
		if (single) {
			return from(this.MPC.currentPlaylist.addId(song));
		}
		return from(this.MPC.currentPlaylist.add(song));
	}
}


export class Playback {
	private MPD: MpdService;
	private MPC: MPC;

	constructor(mpd: MpdService, mpc: MPC) {
		this.MPD = mpd;
		this.MPC = mpc;
	}

	public play(id?: number): Observable<void> {
		if (id !== undefined && id !== null) {
			return from(this.MPC.playback.playId(id));
		}
		return from(this.MPC.playback.play());
	}

	public pause(pause?: boolean): Observable<void> {
		if (typeof pause === "boolean") {
			return from(this.MPC.playback.pause(pause));
		}
		return from(this.MPC.status.status()
			.then((status) => {
				if (["pause", "stop"].includes(status.state)) {
					return this.MPC.playback.pause(false);
				}
				return this.MPC.playback.pause(true);
			}));
	}

	public stop(): Observable<void> {
		return from(this.MPC.playback.stop());
	}

	public next(): Observable<void> {
		return from(this.MPC.playback.next());
	}

	public previous(): Observable<void> {
		return from(this.MPC.playback.previous());
	}

	public seek(time: number): Observable<void> {
		return from(this.MPC.playback.seekCur(time));
	}

	public volume(volume: number): Observable<void> {
		return from(this.MPC.playbackOptions.setVolume(volume));
	}

	public repeat(repeat?: boolean): Observable<void> {
		if (typeof repeat === "boolean") {
			return from(this.MPC.playbackOptions.setRepeat(repeat));
		}
		return from(this.MPC.status.status()
			.then((status) => {
				if (status.repeat) {
					return this.MPC.playbackOptions.setRepeat(false);
				}
				return this.MPC.playbackOptions.setRepeat(true);
			}));
	}

	public shuffle(shuffle?: boolean): Observable<void> {
		if (typeof shuffle === "boolean") {
			return from(this.MPC.playbackOptions.setRandom(shuffle));
		}
		return from(this.MPC.status.status()
			.then((status) => {
				if (status.random) {
					return this.MPC.playbackOptions.setRandom(false);
				}
				return this.MPC.playbackOptions.setRandom(true);
			}));
	}

	public crossfade(seconds: number): Observable<void> {
		return from(this.MPC.playbackOptions.setCrossfade(seconds));
	}

	public single(single?: boolean): Observable<void> {
		if (typeof single === "boolean") {
			return from(this.MPC.playbackOptions.setSingle(single));
		}
		return from(this.MPC.status.status()
			.then((status) => {
				if (status.single) {
					return this.MPC.playbackOptions.setSingle(false);
				}
				return this.MPC.playbackOptions.setSingle(true);
			}));
	}

	public consume(consume?: boolean) {
		if (typeof consume === "boolean") {
			return from(this.MPC.playbackOptions.setConsume(consume));
		}
		return from(this.MPC.status.status()
			.then((status) => {
				if (status.consume) {
					return this.MPC.playbackOptions.setConsume(false);
				}
				return this.MPC.playbackOptions.setConsume(true);
			}));
	}

	public replayGain(mode: "off" | "track" | "album" | "auto") {
		return from(this.MPC.playbackOptions.setReplayGainMode(mode));
	}
}


export class StoredPlaylists {
	private MPD: MpdService;
	private MPC: MPC;

	constructor(mpd: MpdService, mpc: MPC) {
		this.MPD = mpd;
		this.MPC = mpc;
	}

	public save(name: string): Observable<void> {
		return from(this.MPC.storedPlaylists.save(name));
	}

	public add(name: string, uri: string): Observable<void> {
		return from(this.MPC.storedPlaylists.playlistAdd(name, uri));
	}

	public list(playlist?: string): Observable<StoredPlaylist[] | PlaylistItem[]> {
		if (playlist) {
			return from(this.MPC.storedPlaylists.listPlaylistInfo(playlist));
		}
		return from(this.MPC.storedPlaylists.listPlaylists());
	}

	public load(playlist: string): Observable<void> {
		return from(this.MPC.storedPlaylists.load(playlist));
	}

	public delete(playlist: string): Observable<void> {
		return from(this.MPC.storedPlaylists.remove(playlist));
	}

	public rename(oldName: string, newName: string): Observable<void> {
		return from(this.MPC.storedPlaylists.rename(oldName, newName));
	}

	public clear(playlist: string): Observable<void> {
		return from(this.MPC.storedPlaylists.playlistClear(playlist));
	}

	public remove(playlist: string, pos: number): Observable<void> {
		return from(this.MPC.storedPlaylists.playlistDelete(playlist, pos));
	}
}


export class Database {
	private MPD: MpdService;
	private MPC: MPC;

	constructor(mpd: MpdService, mpc: MPC) {
		this.MPD = mpd;
		this.MPC = mpc;
	}

	public list(tag: string, filter?: Array<[string, string]>, groupBy?: string[]): Observable<Map<string[], string[]>> {
		return from(this.MPC.database.list(tag, filter, groupBy));
	}

	public search(tags: Array<[string, string]>, start?: number, end?: number): Observable<Song[]> {
		return from(this.MPC.database.search(tags, start, end));
	}

	public searchAdd(tags: Array<[string, string]>): Observable<void> {
		return from(this.MPC.database.searchAdd(tags));
	}

	public searchAddPlaylist(tags: Array<[string, string]>, playlist: string): Observable<void> {
		return from(this.MPC.database.searchAddPlaylist(`\"${playlist}\"`, tags));
	}

	public listInfo(uri: string): Observable<Array<Song | Playlist | Directory>> {
		return from(this.MPC.database.listInfo(uri));
	}
}


@Injectable({
	providedIn: "root",
})
export class MpdService {
	private MPD: MPC;
	private connectedSource: BehaviorSubject<boolean>;
	private pingTimer: number;
	public connected: Observable<boolean>;
	public current: CurrentPlaylist;
	public playback: Playback;
	public stored: StoredPlaylists;
	public db: Database;

	constructor() {
		this.MPD = new MPC();
		this.connectedSource = new BehaviorSubject<boolean>(false);
		this.connected = this.connectedSource.asObservable();
		this.current = new CurrentPlaylist(this, this.MPD);
		this.playback = new Playback(this, this.MPD);
		this.stored = new StoredPlaylists(this, this.MPD);
		this.db = new Database(this, this.MPD);
	}

	public connect(url: string, password?: string): Observable<boolean> {
		return from(this.MPD.connectWebSocket(url)
			.then(() => this.MPD.connection.password(password)
				.then(() => {
					this.connectedSource.next(true);
					this.pingTimer = window.setInterval(() => this.ping(), 1000);
					return true;
				})
				.catch((err) => {
					console.error("Wrong password?", err);
					this.connectedSource.next(false);
					return false;
				}))
			.catch((err) => {
				console.error("Wrong address?", err);
				this.connectedSource.next(false);
				return false;
			})
		);
	}

	public on(event: string, context?: {}): Observable<void> {
		return fromEvent(this.MPD, event, context);
	}

	public get status(): Observable<Status> {
		return defer(() => this.MPD.status.status())
			.pipe(retry(3));
	}

	public get currentSong(): Observable<PlaylistItem> {
		return defer(() => this.MPD.status.currentSong())
			.pipe(retry(3));
	}

	private ping(): void {
		const timeout = new Promise((resolve, reject) => {
			const id = window.setTimeout(() => {
				window.clearTimeout(id);
				reject();
			}, 1000);
		});
		Promise.race([
			this.MPD.connection.ping(),
			timeout,
		])
		.catch((err) => {
			if (err !== "Disconnected") {
				this.MPD.connection.close();
				this.MPD.disconnect();
				this.connectedSource.next(false);
				window.clearInterval(this.pingTimer);
			}
		});
	}
}
