import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, from, defer, fromEvent, of, merge } from "rxjs";
import { map, mergeAll } from "rxjs/operators";

import Mopidy from "mopidy";
import { Status, PlaylistItem, StoredPlaylist, Song, Directory, Playlist as MPDPlaylist } from "mpc-js-web";


export const SUBSYSTEM_TO_EVENT = {
	"changed-player": ["event:playbackStateChanged", "event:seeked"],
	"changed-playlist": ["event:tracklistChanged", "event:streamTitleChanged"],
	"changed-stored_playlist": ["event:playlistsLoaded", "event:playlistChanged", "event:playlistDeleted"],
	"changed-options": ["event:optionsChanged"],
	"changed-mixer": ["event:volumeChanged"],
	"changed-output": ["event:muteChanged"],
};


export class Ref {
	public uri: string;
	public name: string;
	public type: "album" | "artist" | "directory" | "playlist" | "track";
}


export class Track {
	public uri: string;
	public name: string;
	public artists: Artist[];
	public album: Album;
	public composers: Artist[];
	public performers: Artist[];
	public genre: string;
	public trackNo: number | null;
	public discNo: number | null;
	public date: string;
	public length: number | null;
	public bitrate: number;
	public comment: string;
	public musicbrainzId: string;
	public lastModified: number;
}


export class TlTrack {
	public tlid: number;
	public track: Track;
}


export class Album {
	public uri: string;
	public name: string;
	public artists: Artist[];
	public numTracks: number | null;
	public numDiscs: number | null;
	public date: string;
	public musicbrainzId: string;
}


export class Artist {
	public uri: string;
	public name: string;
	public sortname: string;
	public musicbrainzId: string;
}


export class Playlist {
	public uri: string;
	public name: string;
	public tracks: Track[];
	public lastModified: number;
}


export class SearchResult {
	public uri: string;
	public tracks: Track[];
	public artists: Artist[];
	public albums: Album[];
}


export class File implements Song, Directory, MPDPlaylist {
	public entryType: any;
	public path: string;
	public title: string;
	public name: string;
	public album: string;
	public albumSort: string;
	public albumArtist: string;
	public albumArtistSort: string;
	public artist: string;
	public artistSort: string;
	public composer: string;
	public performer: string;
	public genre: string;
	public date: string;
	public track: string;
	public disc: string;
	public duration: number;
	public lastModified: Date;
	public musicBrainzTrackId: string;
	public musicBrainzReleaseTrackId: string;
	public musicBrainzAlbumId: string;
	public musicBrainzArtistId: string;
	public musicBrainzAlbumArtistId: string;
	public comment: string;

	constructor(file: Ref | Track | Playlist, type: "directory" | "playlist" | "track") {
		switch (type) {
			case "directory":
				this.entryType = "directory";
				this.path = (<Ref> file).uri;
				this.name = (<Ref> file).name;
				break;
			case "playlist":
				this.entryType = "playlist";
				this.path = (<Playlist> file).uri;
				this.name = (<Playlist> file).name;
				break;
			case "track":
				this.entryType = "song";
				this.path = (<Track> file).uri;
				this.title = (<Track> file).name;
				this.name = (<Track> file).name;
				this.album = (<Track> file).album && (<Track> file).album.name;
				this.albumSort = (<Track> file).album && (<Track> file).album.name;
				this.albumArtist = (<Track> file).artists && (<Track> file).artists[0] && (<Track> file).artists[0].name;
				this.albumArtistSort = (<Track> file).artists && (<Track> file).artists[0] && (<Track> file).artists[0].name;
				this.artist = (<Track> file).artists && (<Track> file).artists[0] && (<Track> file).artists[0].name;
				this.artistSort = (<Track> file).artists && (<Track> file).artists[0] && (<Track> file).artists[0].name;
				this.composer = (<Track> file).composers && (<Track> file).composers[0] && (<Track> file).composers[0].name;
				this.performer = (<Track> file).performers && (<Track> file).performers[0] && (<Track> file).performers[0].name;
				this.genre = (<Track> file).genre;
				this.date = (<Track> file).date;
				this.track = (<Track> file).trackNo && (<Track> file).trackNo.toString();
				this.disc = (<Track> file).discNo && (<Track> file).discNo.toString();
				this.duration = (<Track> file).length;
				this.lastModified = new Date((<Track> file).lastModified);
				this.musicBrainzTrackId = (<Track> file).musicbrainzId;
				this.musicBrainzReleaseTrackId = (<Track> file).musicbrainzId;
				this.musicBrainzAlbumId = (<Track> file).album && (<Track> file).album.musicbrainzId;
				this.musicBrainzAlbumArtistId = (<Track> file).artists && (<Track> file).artists[0] && (<Track> file).artists[0].musicbrainzId;
				this.musicBrainzArtistId = (<Track> file).artists && (<Track> file).artists[0] && (<Track> file).artists[0].musicbrainzId;
		}
	}

	public isDirectory(): boolean {
		return this.entryType === "directory";
	}

	public isSong(): boolean {
		return this.entryType === "song";
	}

	public isPlaylist(): boolean {
		return this.entryType === "playlist";
	}

	public isFile() {
		return true;
	}
}


const LIST_MAPPING = {
	Title: "track",
	Album: "album",
	AlbumArtist: "albumartist",
	Artist: "artist",
	Composer: "composer",
	Date: "date",
	Genre: "genre",
	Performer: "performer",
};


const LIST_NAME_MAPPING = {
	track: "Title",
	album: "Album",
	albumartist: "AlbumArtist",
	artist: "Artist",
	composer: "Composer",
	date: "Date",
	genre: "Genre",
	performer: "Performer",
};


const SEARCH_MAPPING = {
	Album: "album",
	AlbumArtist: "albumartist",
	any: "any",
	Artist: "artist",
	Comment: "comment",
	Composer: "composer",
	Date: "date",
	File: "uri",
	Filename: "uri",
	Genre: "genre",
	Performer: "performer",
	Title: "track_name",
	Track: "track_no",
};


function buildQuery(params: string[], mapping: object): object {
	const query = {};
	while (params.length) {
		// tslint:disable-next-line:newline-per-chained-call
		const field = mapping[params.shift()];
		// tslint:disable-next-line:newline-per-chained-call
		const value = params.shift().trim();
		if (field in query) {
			query[field].push(value);
		} else {
			query[field] = [value];
		}
	}
	return query;
}


export class TrackList {
	private mopidy: Mopidy;

	constructor(mopidy: Mopidy) {
		this.mopidy = mopidy;
	}

	public get playlist(): Observable<PlaylistItem> {
		return defer(() => <Promise<TlTrack[]>> this.mopidy.tracklist.getTlTracks())
			.pipe(
				mergeAll(),
				map(({tlid, track}) => {
					return <PlaylistItem> {
						album: track.album && track.album.name,
						artist: track.artists && track.artists[0] && track.artists[0].name,
						date: track.date,
						duration: track.length,
						genre: track.genre,
						id: tlid,
						lastModified: new Date(track.lastModified),
						name: track.name,
						path: track.uri,
						title: track.name,
					};
				}),
			);
	}

	public remove(tlid: number): Observable<void> {
		return from(<Promise<TlTrack[]>> this.mopidy.tracklist.remove([{tlid: [tlid]}]))
			.pipe(map((tltracks) => null));
	}

	public clear(): Observable<void> {
		return from(<Promise<null>> this.mopidy.tracklist.clear());
	}

	public add(uri: string, single = true): Observable<number | void> {
		if (single) {
			return from(<Promise<TlTrack[]>> this.mopidy.tracklist.add({uris: [uri]}))
				.pipe(map((tltracks) => tltracks[0].tlid));
		}
		return from((<Promise<Ref[]>> this.mopidy.library.browse([uri]))
			.then((refs) => {
				const uris = [];
				const extract = async (rfs: Ref[]) => {
					for (const ref of rfs) {
						if (ref.type !== "track") {
							await extract(await this.mopidy.library.browse([ref.uri]));
						} else {
							uris.push(ref.uri);
						}
					}
				};
				return extract(refs)
					.then(() => this.mopidy.tracklist.add({ uris }));
			}));
	}
}


export class Playback {
	private mopidy: Mopidy;

	constructor(mopidy: Mopidy) {
		this.mopidy = mopidy;
	}

	public play(id?: number): Observable<void> {
		if (id !== undefined && id !== null) {
			return from(this.mopidy.playback.play([null, id]))
				.pipe(map(() => null));
		}
		return from(this.mopidy.playback.play())
			.pipe(map(() => null));
	}

	public pause(pause?: boolean): Observable<void> {
		if (typeof pause === "boolean") {
			if (pause) {
				return from(<Promise<void>> this.mopidy.playback.pause());
			}
			return from(<Promise<void>> this.mopidy.playback.play());
		}
		return from((<Promise<"playing" | "paused" | "stopped">> this.mopidy.playback.getState())
			.then((state) => {
				if (state !== "playing") {
					return <Promise<void>> this.mopidy.playback.play();
				}
				return <Promise<void>> this.mopidy.playback.pause();
			}));
	}

	public stop(): Observable<void> {
		return from(<Promise<void>> this.mopidy.playback.stop());
	}

	public next(): Observable<void> {
		return from(<Promise<void>> this.mopidy.playback.next());
	}

	public previous(): Observable<void> {
		return from(<Promise<void>> this.mopidy.playback.previous());
	}

	public seek(time: number): Observable<void> {
		return from(<Promise<boolean>> this.mopidy.playback.seek([time]))
			.pipe(map((success) => null));
	}

	public volume(volume: number): Observable<void> {
		return from(<Promise<boolean>> this.mopidy.mixer.setVolume([volume]))
			.pipe(map((success) => null));
	}

	public repeat(repeat?: boolean): Observable<void> {
		if (typeof repeat === "boolean") {
			return from(<Promise<void>> this.mopidy.tracklist.setRepeat([repeat]));
		}
		return from((<Promise<boolean>> this.mopidy.tracklist.getRepeat())
			.then((enabled) => {
				return <Promise<void>> this.mopidy.tracklist.setRepeat([!enabled]);
			}));
	}

	public shuffle(shuffle?: boolean): Observable<void> {
		if (typeof shuffle === "boolean") {
			return from(<Promise<void>> this.mopidy.tracklist.setRandom([shuffle]));
		}
		return from((<Promise<boolean>> this.mopidy.tracklist.getRandom())
			.then((enabled) => {
				return <Promise<void>> this.mopidy.tracklist.setRandom([!enabled]);
			}));
	}

	public crossfade(seconds: number): Observable<void> {
		return of(null);
	}

	public single(single?: boolean): Observable<void> {
		if (typeof single === "boolean") {
			return from(<Promise<void>> this.mopidy.tracklist.setSingle([single]));
		}
		return from((<Promise<boolean>> this.mopidy.tracklist.getSingle())
			.then((enabled) => {
				return <Promise<void>> this.mopidy.tracklist.setSingle([!enabled]);
			}));
	}

	public consume(consume?: boolean): Observable<void> {
		if (typeof consume === "boolean") {
			return from(<Promise<void>> this.mopidy.tracklist.setConsume([consume]));
		}
		return from((<Promise<boolean>> this.mopidy.tracklist.getConsume())
			.then((enabled) => {
				return <Promise<void>> this.mopidy.tracklist.setConsume([!enabled]);
			}));
	}

	public replayGain(mode: "off" | "track" | "album" | "auto"): Observable<void> {
		return of(null);
	}
}


export class Playlists {
	private mopidy: Mopidy;

	constructor(mopidy: Mopidy) {
		this.mopidy = mopidy;
	}

	public save(name: string): Observable<void> {
		return from((<Promise<Playlist>> this.mopidy.playlists.create([name]))
			.then(async (pls) => {
				const tracks = await this.mopidy.tracklist.getTracks();
				pls.tracks = tracks;
				return (<Promise<Playlist>> this.mopidy.playlists.save([pls]))
					.then(() => null);
			}));
	}

	public add(name: string, uri: string): Observable<void> {
		return from((<Promise<Ref[]>> this.mopidy.playlists.asList())
			.then(async (plsRefs) => {
				const plsRef: Ref = plsRefs.find((ref) => ref.name === name);
				let pls: Playlist;
				// tslint:disable-next-line:prefer-conditional-expression
				if (plsRef) {
					pls = await this.mopidy.playlists.lookup([plsRef.uri]);
				} else {
					pls = await this.mopidy.playlists.create([name]);
				}
				const track: Track = (await this.mopidy.library.lookup([[uri]]))[uri][0];
				pls.tracks ? pls.tracks.push(track) : pls.tracks = [track];
				return (<Promise<Playlist>> this.mopidy.playlists.save([pls]))
					.then(() => null);
			}));
	}

	public list(playlist?: string): Observable<StoredPlaylist[] | PlaylistItem[]> {
		if (playlist) {
			return from((<Promise<Ref[]>> this.mopidy.playlists.asList())
				.then(async (refs) => {
					const plsRef = refs.find((ref) => ref.name === playlist);
					if (plsRef) {
						const pls: Playlist = await this.mopidy.playlists.lookup([plsRef.uri]);
						return this.mopidy.library.lookup([pls.tracks.map((t) => t.uri)])
							.then((res: object) => {
								const tracks: Track[] = Object.values(res)
									.flat();
								return tracks.map((t) => <PlaylistItem> {
									album: t.album && t.album.name,
									albumArtist: t.artists && t.artists[0] && t.artists[0].name,
									artist: t.artists && t.artists[0] && t.artists[0].name,
									date: t.date,
									duration: t.length,
									genre: t.genre,
									lastModified: new Date(t.lastModified),
									name: t.name,
									path: t.uri,
									title: t.name,
								});
							});
					}
					return [];
				}));
		}
		return from((<Promise<Ref[]>> this.mopidy.playlists.asList())
			.then((refs) => <StoredPlaylist[]> refs.map((ref) => <StoredPlaylist> { name: ref.name })));
	}

	public load(playlist: string): Observable<void> {
		return from((<Promise<Ref[]>> this.mopidy.playlists.asList())
			.then(async (refs) => {
				const plsRef = refs.find((ref) => ref.name === playlist);
				if (plsRef) {
					const pls: Playlist = await this.mopidy.playlists.lookup([plsRef.uri]);
					this.mopidy.tracklist.add({ uris: pls.tracks.map((t) => t.uri) });
				}
			}));
	}

	public delete(playlist: string): Observable<void> {
		return from((<Promise<Ref[]>> this.mopidy.playlists.asList())
			.then((refs) => {
				const plsRef = refs.find((ref) => ref.name === playlist);
				if (plsRef) {
					this.mopidy.playlists.delete([plsRef.uri]);
				}
			}));
	}

	public rename(oldName: string, newName: string): Observable<void> {
		return from((<Promise<Ref[]>> this.mopidy.playlists.asList())
			.then(async (refs) => {
				const plsRef = refs.find((ref) => ref.name === oldName);
				if (plsRef) {
					const oldPls: Playlist = await this.mopidy.playlists.lookup([plsRef.uri]);
					const newPls: Playlist = await this.mopidy.playlists.create([newName]);
					newPls.tracks = oldPls.tracks;
					const saved: Playlist = await this.mopidy.playlists.save([newPls]);
					if (saved) {
						this.mopidy.playlists.delete([oldPls.uri]);
					}
				}
			}));
	}

	public clear(playlist: string): Observable<void> {
		return from((<Promise<Ref[]>> this.mopidy.playlists.asList())
			.then(async (refs) => {
				const plsRef = refs.find((ref) => ref.name === playlist);
				if (plsRef) {
					const pls: Playlist = await this.mopidy.playlists.lookup([plsRef.uri]);
					pls.tracks = [];
					this.mopidy.playlists.save([pls]);
				}
			}));
	}

	public remove(playlist: string, pos: number): Observable<void> {
		return from((<Promise<Ref[]>> this.mopidy.playlists.asList())
			.then(async (refs) => {
				const plsRef = refs.find((ref) => ref.name === playlist);
				if (plsRef) {
					const pls: Playlist = await this.mopidy.playlists.lookup([plsRef.uri]);
					pls.tracks.splice(pos, 1);
					this.mopidy.playlists.save([pls]);
				}
			}));
	}
}


export class Library {
	private mopidy: Mopidy;

	constructor(mopidy: Mopidy) {
		this.mopidy = mopidy;
	}

	public list(tag: string, filter?: Array<[string, string]>, groupBy?: string[]): Observable<Map<string[], string[]>> {
		const field: string = LIST_MAPPING[tag];
		const name: string = LIST_NAME_MAPPING[field];
		let query = null;
		if (filter && filter.length) {
			query = buildQuery(filter.flat(), LIST_MAPPING);
		}
		return from((<Promise<string[]>> this.mopidy.library.getDistinct([field, query]))
			.then((res) => {
				return new Map<string[], string[]>([[[], res]] as Array<[string[], string[]]>);
			}));
	}

	public findAlbums(tag: Array<[string, string]>, limit = 4): Observable<string[]> {
		const query = buildQuery(tag.flat(), SEARCH_MAPPING);
		return from((<Promise<string[]>> this.mopidy.library.getDistinct(["album", query]))
			.then((albums) => {
				albums = albums.slice(0, limit);
				return albums;
			}));
	}

	public search(tag: Array<[string, string]>, start?: number, end?: number, exact = false): Observable<Song[]> {
		const query = buildQuery(tag.flat(), SEARCH_MAPPING);
		return from((<Promise<SearchResult[]>> this.mopidy.library.search([query, null, exact]))
			.then((res) => {
				// tslint:disable-next-line:newline-per-chained-call
				const tracks = res.map((r) => r.tracks).flat().filter((t) => !!t);
				if (tracks.length) {
					return tracks.map((track) => <Song> {
						album: track.album && track.album.name,
						albumArtist: track.artists && track.artists[0] && track.artists[0].name,
						albumArtistSort: track.artists && track.artists[0] && track.artists[0].sortname,
						albumSort: track.album && track.album.name,
						artist: track.artists && track.artists[0] && track.artists[0].name,
						artistSort: track.artists && track.artists[0] && track.artists[0].sortname,
						composer: track.composers && track.composers[0] && track.composers[0].name,
						date: track.date,
						disc: track.discNo && track.discNo.toString(),
						duration: track.length,
						genre: track.genre,
						lastModified: new Date(track.lastModified),
						musicBrainzAlbumArtistId: track.artists && track.artists[0] && track.artists[0].musicbrainzId,
						musicBrainzArtistId: track.artists && track.artists[0] && track.artists[0].musicbrainzId,
						musicBrainzAlbumId: track.album && track.album.musicbrainzId,
						musicBrainzReleaseTrackId: track.musicbrainzId,
						musicBrainzTrackId: track.musicbrainzId,
						name: track.name,
						path: track.uri,
						performer: track.performers && track.performers[0] && track.performers[0].name,
						title: track.name,
						track: track.trackNo && track.trackNo.toString(),
					});
				}
				return [];
			}));
	}

	public searchAdd(tags: Array<[string, string]>, exact = true): Observable<void> {
		const query = buildQuery(tags.flat(), SEARCH_MAPPING);
		return from((<Promise<SearchResult[]>> this.mopidy.library.search([query, null, exact]))
			.then((res) => {
				// tslint:disable-next-line:newline-per-chained-call
				const tracks = res.map((r) => r.tracks).flat().filter((t) => !!t);
				if (tracks.length) {
					return (<Promise<TlTrack[]>> this.mopidy.tracklist.add({uris: tracks.map((t) => t.uri)}))
						.then(() => null);
				}
				return null;
			}));
	}

	public searchAddPlaylist(tags: Array<[string, string]>, playlist: string, exact = true): Observable<void> {
		const query = buildQuery(tags.flat(), SEARCH_MAPPING);
		return from((<Promise<SearchResult[]>> this.mopidy.library.search([query, null, exact]))
			.then(async (res) => {
				// tslint:disable-next-line:newline-per-chained-call
				const tracks = res.map((r) => r.tracks).flat().filter((t) => !!t);
				if (tracks.length) {
					const ref: Ref = (await <Promise<Ref[]>> this.mopidy.playlists.asList()).find((r) => r.name === playlist);
					const pls: Playlist = ref ? (await this.mopidy.playlists.lookup([ref.uri])) : (await this.mopidy.playlists.create([playlist]));
					pls.tracks ? pls.tracks = pls.tracks.concat(tracks) : pls.tracks = tracks;
					return (<Promise<Playlist>> this.mopidy.playlists.save([pls]))
						.then(() => null);
				}
			}));
	}

	public listInfo(uri: string | null): Observable<Array<Song | Directory | MPDPlaylist>> {
		return from((<Promise<Ref[]>> this.mopidy.library.browse([uri]))
			.then(async (refs) => {
				const trackUris: string[] = [];
				for (const ref of refs) {
					if (ref.type === "track") {
						trackUris.push(ref.uri);
					}
				}
				let tracks: Track[];
				if (trackUris.length) {
					// tslint:disable-next-line:newline-per-chained-call
					tracks = Object.values(await this.mopidy.library.lookup([trackUris])).flat();
				}
				return refs.map((ref) => {
					switch (ref.type) {
						case "album":
						case "artist":
						case "directory":
							return <Directory> new File(ref, "directory");
							break;
						case "playlist":
							return <MPDPlaylist> new File(ref, ref.type);
							break;
						case "track":
							return <Song> new File(tracks.find((t) => t.uri === ref.uri), ref.type);
					}
				});
			}));
	}
}


@Injectable({
	providedIn: "root",
})
export class MopidyService {
	private connectedSource: BehaviorSubject<boolean>;
	public mopidy: Mopidy;
	public connected: Observable<boolean>;
	public current: TrackList;
	public playback: Playback;
	public stored: Playlists;
	public db: Library;

	constructor() {
		this.connectedSource = new BehaviorSubject<boolean>(false);
		this.connected = this.connectedSource.asObservable();
	}

	public connect(url: string, password?: string): Observable<boolean> {
		this.mopidy = new Mopidy({
			webSocketUrl: url,
		});
		this.current = new TrackList(this.mopidy);
		this.playback = new Playback(this.mopidy);
		this.stored = new Playlists(this.mopidy);
		this.db = new Library(this.mopidy);
		return fromEvent(this.mopidy, "state")
			.pipe(map((event) => {
				if (event === "state:online") {
					this.connectedSource.next(true);
					return true;
				}
				this.connectedSource.next(false);
				return false;
			}));
	}

	public on(event: string, context?: {}): Observable<void> {
		const events: string[] = SUBSYSTEM_TO_EVENT[event];
		return merge(...events.map((e) => fromEvent<void>(this.mopidy, e, context)));
	}

	public removeAllListeners(event?: string): MopidyService {
		this.mopidy.removeAllListeners(event);
		return this;
	}

	public get status(): Observable<Status> {
		return <Observable<Status>> from(Promise.all([
			this.mopidy.playback.getState(),
			this.mopidy.tracklist.getRandom(),
			this.mopidy.tracklist.getConsume(),
			this.mopidy.tracklist.getRepeat(),
			this.mopidy.tracklist.getSingle(),
			this.mopidy.mixer.getVolume(),
			this.mopidy.playback.getCurrentTrack(),
			this.mopidy.playback.getTimePosition(),
		])
		.then(([state, random, consume, repeat, single, volume, track, pos]) => {
			return {
				state: state === "playing" ? "play" : state === "stopped" ? "stop" : "pause",
				random,
				xfade: 0,
				consume,
				volume,
				repeat,
				single,
				duration: track && track.length,
				elapsed: pos,
			};
		}));
	}

	public get currentSong(): Observable<PlaylistItem> {
		return from((<Promise<TlTrack>> this.mopidy.playback.getCurrentTlTrack())
			.then((tltrack) => {
				const track = tltrack && tltrack.track;
				const tlid = tltrack && tltrack.tlid;
				return <PlaylistItem> {
					album: track && track.album && track.album.name,
					albumArtist: track && track.artists && track.artists[0] && track.artists[0].name,
					artist: track && track.artists && track.artists[0] && track.artists[0].name,
					date: track && track.date,
					duration: track && track.length,
					genre: track && track.genre,
					id: tlid,
					lastModified: track && new Date(track.lastModified),
					name: track && track.name,
					path: track && track.uri,
					title: track && track.name,
				};
			}));
	}
}
