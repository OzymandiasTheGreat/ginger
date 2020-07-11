import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, from, defer, fromEvent, of } from "rxjs";
import { mergeAll, retry } from "rxjs/operators";

import { MPC, PlaylistItem, Status, StoredPlaylist, Song, Playlist, Directory } from "mpc-js-web";


export class CurrentPlaylist {
	private MPD: MpdService;

	constructor(mpd: MpdService) {
		this.MPD = mpd;
	}

	public get playlist(): Observable<PlaylistItem | undefined> {
		return defer(() => this.MPD.MPD.currentPlaylist.playlistInfo())
			.pipe(
				retry(3),
				mergeAll(),
			);
	}

	public remove(id: number): Observable<void> {
		return from(this.MPD.MPD.currentPlaylist.deleteId(id));
	}

	public clear(): Observable<void> {
		return from(this.MPD.MPD.currentPlaylist.clear());
	}

	public add(song: string, single = true): Observable<number | void> {
		if (single) {
			return from(this.MPD.MPD.currentPlaylist.addId(song));
		}
		return from(this.MPD.MPD.currentPlaylist.add(song));
	}
}


export class Playback {
	private MPD: MpdService;

	constructor(mpd: MpdService) {
		this.MPD = mpd;
	}

	public play(id?: number): Observable<void> {
		if (id !== undefined && id !== null) {
			return from(this.MPD.MPD.playback.playId(id));
		}
		return from(this.MPD.MPD.playback.play());
	}

	public pause(pause?: boolean): Observable<void> {
		if (typeof pause === "boolean") {
			return from(this.MPD.MPD.playback.pause(pause));
		}
		return from(this.MPD.MPD.status.status()
			.then((status) => {
				if (["pause", "stop"].includes(status.state)) {
					return this.MPD.MPD.playback.pause(false);
				}
				return this.MPD.MPD.playback.pause(true);
			}));
	}

	public stop(): Observable<void> {
		return from(this.MPD.MPD.playback.stop());
	}

	public next(): Observable<void> {
		return from(this.MPD.MPD.playback.next());
	}

	public previous(): Observable<void> {
		return from(this.MPD.MPD.playback.previous());
	}

	public seek(time: number): Observable<void> {
		return from(this.MPD.MPD.playback.seekCur(time));
	}

	public volume(volume: number): Observable<void> {
		return from(this.MPD.MPD.playbackOptions.setVolume(volume));
	}

	public repeat(repeat?: boolean): Observable<void> {
		if (typeof repeat === "boolean") {
			return from(this.MPD.MPD.playbackOptions.setRepeat(repeat));
		}
		return from(this.MPD.MPD.status.status()
			.then((status) => {
				if (status.repeat) {
					return this.MPD.MPD.playbackOptions.setRepeat(false);
				}
				return this.MPD.MPD.playbackOptions.setRepeat(true);
			}));
	}

	public shuffle(shuffle?: boolean): Observable<void> {
		if (typeof shuffle === "boolean") {
			return from(this.MPD.MPD.playbackOptions.setRandom(shuffle));
		}
		return from(this.MPD.MPD.status.status()
			.then((status) => {
				if (status.random) {
					return this.MPD.MPD.playbackOptions.setRandom(false);
				}
				return this.MPD.MPD.playbackOptions.setRandom(true);
			}));
	}

	public crossfade(seconds: number): Observable<void> {
		return from(this.MPD.MPD.playbackOptions.setCrossfade(seconds));
	}

	public single(single?: boolean): Observable<void> {
		if (typeof single === "boolean") {
			return from(this.MPD.MPD.playbackOptions.setSingle(single));
		}
		return from(this.MPD.MPD.status.status()
			.then((status) => {
				if (status.single) {
					return this.MPD.MPD.playbackOptions.setSingle(false);
				}
				return this.MPD.MPD.playbackOptions.setSingle(true);
			}));
	}

	public consume(consume?: boolean) {
		if (typeof consume === "boolean") {
			return from(this.MPD.MPD.playbackOptions.setConsume(consume));
		}
		return from(this.MPD.MPD.status.status()
			.then((status) => {
				if (status.consume) {
					return this.MPD.MPD.playbackOptions.setConsume(false);
				}
				return this.MPD.MPD.playbackOptions.setConsume(true);
			}));
	}

	public replayGain(mode: "off" | "track" | "album" | "auto") {
		return from(this.MPD.MPD.playbackOptions.setReplayGainMode(mode));
	}
}


export class StoredPlaylists {
	private MPD: MpdService;

	constructor(mpd: MpdService) {
		this.MPD = mpd;
	}

	public save(name: string): Observable<void> {
		return from(this.MPD.MPD.storedPlaylists.save(name));
	}

	public add(name: string, uri: string): Observable<void> {
		return from(this.MPD.MPD.storedPlaylists.playlistAdd(name, uri));
	}

	public list(playlist?: string): Observable<StoredPlaylist[] | PlaylistItem[]> {
		if (playlist) {
			return from(this.MPD.MPD.storedPlaylists.listPlaylistInfo(playlist));
		}
		return from(this.MPD.MPD.storedPlaylists.listPlaylists());
	}

	public load(playlist: string): Observable<void> {
		return from(this.MPD.MPD.storedPlaylists.load(playlist));
	}

	public delete(playlist: string): Observable<void> {
		return from(this.MPD.MPD.storedPlaylists.remove(playlist));
	}

	public rename(oldName: string, newName: string): Observable<void> {
		return from(this.MPD.MPD.storedPlaylists.rename(oldName, newName));
	}

	public clear(playlist: string): Observable<void> {
		return from(this.MPD.MPD.storedPlaylists.playlistClear(playlist));
	}

	public remove(playlist: string, pos: number): Observable<void> {
		return from(this.MPD.MPD.storedPlaylists.playlistDelete(playlist, pos));
	}
}


export class Database {
	private MPD: MpdService;

	constructor(mpd: MpdService) {
		this.MPD = mpd;
	}

	public list(tag: string, filter?: Array<[string, string]>, groupBy?: string[]): Observable<Map<string[], string[]>> {
		return from(this.MPD.MPD.database.list(tag, filter, groupBy));
	}

	public search(tags: Array<[string, string]>, start?: number, end?: number, exact?: boolean): Observable<Song[]> {
		return from(this.MPD.MPD.database.search(tags, start, end));
	}

	public searchAdd(tags: Array<[string, string]>, exact?: boolean): Observable<void> {
		return from(this.MPD.MPD.database.searchAdd(tags));
	}

	public searchAddPlaylist(tags: Array<[string, string]>, playlist: string): Observable<void> {
		return from(this.MPD.MPD.database.searchAddPlaylist(`\"${playlist}\"`, tags));
	}

	public listInfo(uri: string): Observable<Array<Song | Playlist | Directory>> {
		return from(this.MPD.MPD.database.listInfo(uri));
	}
}


@Injectable({
	providedIn: "root",
})
export class MpdService {
	private connectedSource: BehaviorSubject<boolean>;
	private pingTimer: any;
	public MPD: MPC;
	public connected: Observable<boolean>;
	public current: CurrentPlaylist;
	public playback: Playback;
	public stored: StoredPlaylists;
	public db: Database;

	constructor() {
		this.MPD = new MPC();
		this.connectedSource = new BehaviorSubject<boolean>(false);
		this.connected = this.connectedSource.asObservable();
		this.current = new CurrentPlaylist(this);
		this.playback = new Playback(this);
		this.stored = new StoredPlaylists(this);
		this.db = new Database(this);

		this.MPD.on("socket-end", (err) => {
			console.warn("SOCKET CLOSED", err);
			delete this.MPD;
			this.MPD = new MPC();
			this.connectedSource.next(false);
			clearInterval(this.pingTimer);
		});
		this.MPD.on("socket-error", (err) => {
			console.warn("SOCKET ERROR", err);
			this.connectedSource.next(false);
			clearInterval(this.pingTimer);
		});
	}

	public connect(url: string, password?: string): Observable<boolean> {
		try {
			return from(this.MPD.connectWebSocket(url)
				.then(() => {
					if (password) {
						return this.MPD.connection.password(password)
							.then(() => {
								this.connectedSource.next(true);
								this.pingTimer = setInterval(() => this.ping(), 1000);
								return true;
							})
							.catch((err) => {
								console.error("Wrong password?", err);
								this.connectedSource.next(false);
								return false;
							});
					}
					this.connectedSource.next(true);
					this.pingTimer = setInterval(() => this.ping(), 1000);
					return true;
				})
				.catch((err) => {
					console.error("Wrong address?", err);
					this.connectedSource.next(false);
					return false;
				})
			);
		} catch (err) {
			if (err.message === "Client is already connected") {
				this.connectedSource.next(true);
				return of(true);
			}
			this.connectedSource.next(false);
			return of(false);
		}
	}

	public on(event: string, context?: {}): Observable<void> {
		return fromEvent(this.MPD, event, context);
	}

	public removeAllListeners(event?: string): MPC {
		return this.MPD.removeAllListeners(event);
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
			const id = setTimeout(() => {
				clearTimeout(id);
				reject();
			}, 60000);
		});
		Promise.race([
			this.MPD.connection.ping(),
			timeout,
		])
		.catch((err) => {
			delete this.MPD;
			this.MPD = new MPC();
			this.connectedSource.next(false);
			clearInterval(this.pingTimer);
		});
	}
}
