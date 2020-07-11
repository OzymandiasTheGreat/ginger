import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { takeUntil, skip, tap } from "rxjs/operators";

import { Status, PlaylistItem } from "mpc-js-web";
import "nativescript-websockets";

import { MpdService, CurrentPlaylist, Playback as MPDPlayback, StoredPlaylists, Database } from "@src/app/shared/services/mpd.service";
import {
	MopidyService,
	TrackList,
	Playback as MopidyPlayback,
	Playlists,
	Library,
} from "@src/app/shared/services/mopidy.service";


@Injectable({
	providedIn: "root",
})
export class MPClientService {
	public mopidy: boolean;
	private connectedSource: BehaviorSubject<boolean>;
	private ngUnsubscribe: Subject<void>;
	public connected: Observable<boolean>;
	public current: CurrentPlaylist | TrackList;
	public playback: MPDPlayback | MopidyPlayback;
	public stored: StoredPlaylists | Playlists;
	public db: Database | Library;

	constructor(private mpdService: MpdService, private mopidyService: MopidyService) {
		this.connectedSource = new BehaviorSubject<boolean>(false);
		this.connected = this.connectedSource.asObservable();
		this.ngUnsubscribe = new Subject<void>();
	}

	public connect(uri: string, password: string, mopidy: boolean): Observable<boolean> {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
		this.ngUnsubscribe = new Subject<void>();
		this.mopidy = mopidy;
		if (mopidy) {
			this.mopidyService.connected
				.pipe(
					skip(1),
					takeUntil(this.ngUnsubscribe),
				)
				.subscribe(this.connectedSource);
			return this.mopidyService.connect(uri)
				.pipe(tap((success) => {
					if (success) {
						this.current = this.mopidyService.current;
						this.playback = this.mopidyService.playback;
						this.stored = this.mopidyService.stored;
						this.db = this.mopidyService.db;
					}
				}));
		}
		this.mpdService.connected
			.pipe(
				skip(1),
				takeUntil(this.ngUnsubscribe),
			)
			.subscribe(this.connectedSource);
		return this.mpdService.connect(uri, password)
			.pipe(tap((success) => {
				if (success) {
					this.current = this.mpdService.current;
					this.playback = this.mpdService.playback;
					this.stored = this.mpdService.stored;
					this.db = this.mpdService.db;
				}
			}));
	}

	public on(event: string, context?: {}): Observable<void> {
		if (this.mopidy) {
			return this.mopidyService.on(event, context);
		}
		return this.mpdService.on(event, context);
	}

	public removeAllListeners(event?: string) {
		if (this.mopidy) {
			return this.mopidyService.removeAllListeners(event);
		}
		return this.mpdService.removeAllListeners(event);
	}

	public get status(): Observable<Status> {
		if (this.mopidy) {
			return this.mopidyService.status;
		}
		return this.mpdService.status;
	}

	public get currentSong(): Observable<PlaylistItem> {
		if (this.mopidy) {
			return this.mopidyService.currentSong;
		}
		return this.mpdService.currentSong;
	}
}
