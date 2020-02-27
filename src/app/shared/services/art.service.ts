import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, Subject, of, forkJoin } from "rxjs";
import { toArray, concatAll } from "rxjs/operators";

const SPOTIFY_CLIENT_ID = "3f974573800a4ff5b325de9795b8e603";
const SPOTIFY_CLIENT_SECRET = "ff188d2860ff44baa57acc79c121a3b9";
const LASTFM_API_KEY = "956c1818ded606576d6941de5ff793a5";


export enum StorageKey {
	SpotifyAbumSmall = "spotify_album_small",
	SpotifyAbumLarge = "spotify_album_large",
	SpotifyArtistSmall = "spotify_artist_small",
	SpotifyArtistLarge = "spotify_artist_large",
	LastFMAlbumSmall = "lastfm_album_small",
	LastFMAlbumLarge = "lastfm_album_large",
	LastFMArtistSmall = "lastfm_artist_small",
	LastFMArtistLarge = "lastfm_artist_large",
}


export interface ISpotifySearchResult {
	albums: {
		items: Array<{ images: Array<{height: number, url: string, width: number}> }>,
	};
	artists: {
		items: Array<{ images: Array<{height: number, url: string, width: number}> }>,
	};
}


@Injectable({
	providedIn: "root"
})
export class ArtService {
	private spotifyAPIEndPoint = "https://api.spotify.com/v1/search";
	private spotifyAuthEndPoint = "https://accounts.spotify.com/api/token";
	private spotifyAuthToken: string;
	private lastFMAPIEndPoint = "https://ws.audioscrobbler.com/2.0/";

	constructor(private http: HttpClient) {
		this.authenticate();
	}

	public getStorageKey(key: StorageKey, artist: string, album?: string): string {
		if (album) {
			return `${key}-${artist}-${album}`.replace(/\s/, "_");
		}
		return `${key}-${artist}`.replace(/\s/, "_");
	}

	public async authenticate() {
		const spotifyAuth = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
		this.spotifyAuthToken = await fetch(this.spotifyAuthEndPoint, {
			method: "post",
			body: "grant_type=client_credentials",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${spotifyAuth}`
			},
		})
		.then((response) => response.json())
		.then((json) => json.access_token);
	}

	public getSpotifyArt(artist: string, large: boolean, album?: string): Observable<string> {
		const subject = new Subject<string>();
		let params = new HttpParams();
		params = params.append("q", `${artist}${album ? " " + album : ""}`);
		params = params.append("type", album ? "album" : "artist");
		params = params.append("limit", "1");
		this.http.get(this.spotifyAPIEndPoint, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Bearer ${this.spotifyAuthToken}`,
			},
			params,
			observe: "body",
			responseType: "json",
		})
		.subscribe((response: ISpotifySearchResult) => {
			if (
				!(<any> response).error
				&& ((response.albums && response.albums.items && response.albums.items.length > 0)
				|| (response.artists && response.artists.items && response.artists.items.length > 0))
			) {
				const images = album ? response.albums.items[0].images : response.artists.items[0].images;
				let smallest = images[0];
				let largest = images[0];
				for (const image of images) {
					if (image.width < smallest.width) {
						smallest = image;
					}
					if (image.width > largest.width) {
						largest = image;
					}
				}
				if (album) {
					window.localStorage.setItem(this.getStorageKey(StorageKey.SpotifyAbumSmall, artist, album), smallest.url);
					window.localStorage.setItem(this.getStorageKey(StorageKey.SpotifyAbumLarge, artist, album), largest.url);
				} else {
					window.localStorage.setItem(this.getStorageKey(StorageKey.SpotifyArtistSmall, artist), smallest.url);
					window.localStorage.setItem(this.getStorageKey(StorageKey.SpotifyArtistLarge, artist), largest.url);
				}
				subject.next(large ? largest.url : smallest.url);
			}
			subject.complete();
		});
		return subject.asObservable();
	}

	public getLastFMArt(artist: string, large: boolean, album?: string): Observable<string> {
		const subject = new Subject<string>();
		let params = new HttpParams();
		params = params.append("api_key", LASTFM_API_KEY);
		params = params.append("artist", artist);
		params = params.append("format", "json");
		params = params.append("autoCorrect", "true");
		if (album) {
			params = params.append("method", "album.getinfo");
			params = params.append("album", album);
		} else {
			params = params.append("method", "artist.getinfo");
		}
		this.http.get(this.lastFMAPIEndPoint, {
			params,
			observe: "body",
			responseType: "json",
		})
		.subscribe((response: any) => {
			if ((response.album && response.album.image) || (response.artist && response.artist.image)) {
				const images = album ? response.album.image : response.artist.image;
				const smallest = images.length > 1 ? images[1]["#text"] : images[0]["#text"];
				const largest = images[images.length - 1]["#text"];
				if (album) {
					window.localStorage.setItem(this.getStorageKey(StorageKey.LastFMAlbumSmall, artist, album), smallest);
					window.localStorage.setItem(this.getStorageKey(StorageKey.LastFMAlbumLarge, artist, album), largest);
				} else {
					window.localStorage.setItem(this.getStorageKey(StorageKey.LastFMArtistSmall, artist), smallest);
					window.localStorage.setItem(this.getStorageKey(StorageKey.LastFMArtistLarge, artist), largest);
				}
				subject.next(large ? largest : smallest);
			}
			subject.complete();
		})
		return subject.asObservable();
	}

	public getArt(artist: string, album?: string, large: boolean = false): Observable<string[]> {
		const ret = [];
		let spotifyUrl;
		let lastfmUrl;
		if (!artist || artist.length < 1) {
			return of(ret);
		}
		if (large) {
			if (album) {
				spotifyUrl = window.localStorage.getItem(this.getStorageKey(StorageKey.SpotifyAbumLarge, artist, album));
				lastfmUrl = window.localStorage.getItem(this.getStorageKey(StorageKey.LastFMAlbumLarge, artist, album));
			} else {
				spotifyUrl = window.localStorage.getItem(this.getStorageKey(StorageKey.SpotifyArtistLarge, artist));
				lastfmUrl = window.localStorage.getItem(this.getStorageKey(StorageKey.LastFMArtistLarge, artist));
			}
			if (spotifyUrl) {
				ret.push(spotifyUrl);
			}
			if (lastfmUrl) {
				ret.push(lastfmUrl);
			}
		} else {
			if (album) {
				spotifyUrl = window.localStorage.getItem(this.getStorageKey(StorageKey.SpotifyAbumSmall, artist, album));
				lastfmUrl = window.localStorage.getItem(this.getStorageKey(StorageKey.LastFMAlbumSmall, artist, album));
			} else {
				spotifyUrl = window.localStorage.getItem(this.getStorageKey(StorageKey.SpotifyArtistSmall, artist));
				lastfmUrl = window.localStorage.getItem(this.getStorageKey(StorageKey.LastFMArtistSmall, artist));
			}
			if (spotifyUrl) {
				ret.push(spotifyUrl);
			}
			if (lastfmUrl) {
				ret.push(lastfmUrl);
			}
		}
		if (ret.length > 0) {
			return of(ret);
		}
		return forkJoin([
			this.getSpotifyArt(artist, large, album),
			this.getLastFMArt(artist, large, album),
		]);
	}

}
