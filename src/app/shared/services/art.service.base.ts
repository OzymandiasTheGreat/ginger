import { Observable, Subject, of, forkJoin, from } from "rxjs";

import { base64Encode } from "@src/app/shared/functions/base64";
import { buildQuery } from "@src/app/shared/functions/url";


const SPOTIFY_CLIENT_ID = "3f974573800a4ff5b325de9795b8e603";
const SPOTIFY_CLIENT_SECRET = "ff188d2860ff44baa57acc79c121a3b9";
const LASTFM_API_KEY = "956c1818ded606576d6941de5ff793a5";


export enum StorageKey {
	SpotifyAbumSmall = "SPOTIFY_ALBUM_SMALL",
	SpotifyAbumLarge = "SPOTIFY_ALBUM_LARGE",
	SpotifyArtistSmall = "SPOTIFY_ARTIST_SMALL",
	SpotifyArtistLarge = "SPOTIFY_ARTIST_LARGE",
	LastFMAlbumSmall = "LASTFM_ALBUM_SMALL",
	LastFMAlbumLarge = "LASTFM_ALBUM_LARGE",
	LastFMArtistSmall = "LASTFM_ARTIST_SMALL",
	LastFMArtistLarge = "LASTFM_ARTIST_LARGE",
}


export class ArtBaseService {
	private spotifyAPIEndPoint = "https://api.spotify.com/v1/search";
	private spotifyAuthEndPoint = "https://accounts.spotify.com/api/token";
	private spotifyAuthToken: string;
	private lastFMAPIEndPoint = "https://ws.audioscrobbler.com/2.0/";

	constructor(
		private getter: (key: string) => string,
		private setter: (key: string, value: string) => void,
	) {
		this.authenticate();
	}

	public getStorageKey(key: StorageKey, artist: string, album?: string): string {
		if (album) {
			return `${key}-${artist}-${album}`.replace(/\s/, "_");
		}
		return `${key}-${artist}`.replace(/\s/, "_");
	}

	public async authenticate() {
		const spotifyAuth = base64Encode(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
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
		from(fetch(buildQuery(this.spotifyAPIEndPoint, {
			q: `${artist}${album ? " " + album : ""}`,
			type: album ? "album" : "artist",
			limit: 1,
		}), {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Bearer ${this.spotifyAuthToken}`,
			}
		})
		.then((response) => response.json()))
		.subscribe((response: any) => {
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
					this.setter(this.getStorageKey(StorageKey.SpotifyAbumSmall, artist, album), smallest.url);
					this.setter(this.getStorageKey(StorageKey.SpotifyAbumLarge, artist, album), largest.url);
				} else {
					this.setter(this.getStorageKey(StorageKey.SpotifyArtistSmall, artist), smallest.url);
					this.setter(this.getStorageKey(StorageKey.SpotifyArtistLarge, artist), largest.url);
				}
				subject.next(large ? largest.url : smallest.url);
			}
			subject.complete();
		});
		return subject.asObservable();
	}

	public getLastFMArt(artist: string, large: boolean, album?: string): Observable<string> {
		const subject = new Subject<string>();
		const params: any = {
			api_key: LASTFM_API_KEY,
			artist,
			format: "json",
			autoCorrect: "true",
		};
		if (album) {
			params.method = "album.getinfo";
			params.album = album;
		} else {
			params.method = "artist.getinfo";
		}
		from(fetch(buildQuery(this.lastFMAPIEndPoint, params))
		.then((response) => response.json()))
		.subscribe((response: any) => {
			if ((response.album && response.album.image) || (response.artist && response.artist.image)) {
				const images = album ? response.album.image : response.artist.image;
				const smallest = images.length > 1 ? images[1]["#text"] : images[0]["#text"];
				const largest = images[images.length - 1]["#text"];
				if (album) {
					this.setter(this.getStorageKey(StorageKey.LastFMAlbumSmall, artist, album), smallest);
					this.setter(this.getStorageKey(StorageKey.LastFMAlbumLarge, artist, album), largest);
				} else {
					this.setter(this.getStorageKey(StorageKey.LastFMArtistSmall, artist), smallest);
					this.setter(this.getStorageKey(StorageKey.LastFMArtistLarge, artist), largest);
				}
				subject.next(large ? largest : smallest);
			}
			subject.complete();
		});
		return subject.asObservable();
	}

	public getArt(artist: string | void, album?: string | void, large: boolean = false): Observable<string[]> {
		const ret = [];
		let spotifyUrl;
		let lastfmUrl;
		if (!artist || artist.length < 1) {
			return of(ret);
		}
		if (large) {
			if (album) {
				spotifyUrl = this.getter(this.getStorageKey(StorageKey.SpotifyAbumLarge, artist, album));
				lastfmUrl = this.getter(this.getStorageKey(StorageKey.LastFMAlbumLarge, artist, album));
			} else {
				spotifyUrl = this.getter(this.getStorageKey(StorageKey.SpotifyArtistLarge, artist));
				lastfmUrl = this.getter(this.getStorageKey(StorageKey.LastFMArtistLarge, artist));
			}
			if (spotifyUrl) {
				ret.push(spotifyUrl);
			}
			if (lastfmUrl) {
				ret.push(lastfmUrl);
			}
		} else {
			if (album) {
				spotifyUrl = this.getter(this.getStorageKey(StorageKey.SpotifyAbumSmall, artist, album));
				lastfmUrl = this.getter(this.getStorageKey(StorageKey.LastFMAlbumSmall, artist, album));
			} else {
				spotifyUrl = this.getter(this.getStorageKey(StorageKey.SpotifyArtistSmall, artist));
				lastfmUrl = this.getter(this.getStorageKey(StorageKey.LastFMArtistSmall, artist));
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
			this.getSpotifyArt(artist, large, <string> album),
			this.getLastFMArt(artist, large, <string> album),
		]);
	}

}
