import { base64Encode } from "@src/app/functions/base64";
import { buildQuery } from "@src/app/functions/url";


declare const SPOTIFY_CLIENT_ID: string;
declare const SPOTIFY_CLIENT_SECRET: string;
declare const LASTFM_API_KEY: string;


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


export class ArtBase {
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

	getStorageKey(key: StorageKey, artist: string, album?: string): string {
		if (album) {
			return `${key}-${artist}-${album}`.replace(/\s/g, "_");
		}
		return `${key}-${artist}`.replace(/\s/g, "_");
	}

	async authenticate(): Promise<void> {
		const authKey = base64Encode(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
		this.spotifyAuthToken = await fetch(this.spotifyAuthEndPoint, {
			method: "POST",
			body: "grant_type=client_credentials",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${authKey}`,
			},
		}).then((response) => response.json()).then((json) => json.access_token);
	}

	async getSpotifyArt(artist: string, album?: string, large: boolean = false): Promise<string> {
		return fetch(buildQuery(this.spotifyAPIEndPoint, {
			q: `${artist}${!!album ? " " + album : ""}`,
			type: !!album ? "album" : "artist",
			limit: 1,
		}), {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Bearer ${this.spotifyAuthToken}`,
			},
		}).then((response) => response.json()).then((response) => {
			if (
				!response.error
				&& ((response.albums && response.albums.items && response.albums.items.length > 0)
				|| (response.artists && response.artists.items && response.artists.items.length > 0))
			) {
				const images = !!album ? response.albums.items[0].images : response.artists.items[0].images;
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
					if (smallest) {
						this.setter(this.getStorageKey(StorageKey.SpotifyAbumSmall, artist, album), smallest.url);
					}
					if (largest) {
						this.setter(this.getStorageKey(StorageKey.SpotifyAbumLarge, artist, album), largest.url);
					}
				} else {
					if (smallest) {
						this.setter(this.getStorageKey(StorageKey.SpotifyArtistSmall, artist), smallest.url);
					}
					if (largest) {
						this.setter(this.getStorageKey(StorageKey.SpotifyArtistLarge, artist), largest.url);
					}
				}
				return large ? largest?.url : smallest?.url;
			}
		});
	}

	async getLastFMArt(artist: string, album?: string, large: boolean = false): Promise<string> {
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
		return fetch(buildQuery(this.lastFMAPIEndPoint, params))
			.then((response) => response.json())
			.then((response) => {
				if ((response.album && response.album.image) || (response.artist && response.artist.image)) {
					const images = !!album ? response.album.image : response.artist.image;
					const smallest = images.length > 1 ? images[1]["#text"] : images[0]["#text"];
					const largest = images[images.length - 1]["#text"];
					if (album) {
						this.setter(this.getStorageKey(StorageKey.LastFMAlbumSmall, artist, album), smallest);
						this.setter(this.getStorageKey(StorageKey.LastFMAlbumLarge, artist, album), largest);
					} else {
						this.setter(this.getStorageKey(StorageKey.LastFMArtistSmall, artist), smallest);
						this.setter(this.getStorageKey(StorageKey.LastFMArtistLarge, artist), largest);
					}
					return large ? largest : smallest;
				}
			});
	}

	async getArt(artist?: string, album?: string, large: boolean = false): Promise<string[]> {
		const spotifyKey = large
			? !!album ? StorageKey.SpotifyAbumLarge : StorageKey.SpotifyArtistLarge
			: !!album ? StorageKey.SpotifyAbumSmall : StorageKey.SpotifyArtistSmall;
		const lastFMKey = large
			? !!album ? StorageKey.LastFMAlbumLarge : StorageKey.LastFMArtistLarge
			: !!album ? StorageKey.LastFMAlbumSmall : StorageKey.LastFMArtistSmall;
		return new Promise((resolve) => {
			let spotify, lastFM;
			if (album) {
				spotify = this.getter(this.getStorageKey(spotifyKey, artist, album));
				lastFM = this.getter(this.getStorageKey(lastFMKey, artist, album));
			} else {
				spotify = this.getter(this.getStorageKey(spotifyKey, artist));
				lastFM = this.getter(this.getStorageKey(lastFMKey, artist));
			}
			if (spotify || lastFM) {
				resolve([lastFM, spotify]);
			} else {
				resolve(Promise.all([
					this.getLastFMArt(artist, album, large),
					this.getSpotifyArt(artist, album, large),
				]));
			}
		});
	}
}
