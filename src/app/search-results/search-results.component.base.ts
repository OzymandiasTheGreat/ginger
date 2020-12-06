import { ActivatedRoute } from "@angular/router";
import * as parser from "search-query-parser";

import { MopidyTrack, Track } from "@src/app/types/track";
import { song2track, track2track } from "@src/app/functions/track";
import { GridItem, GridType } from "@src/app/core/components/browser-grid/browser-grid.component.base";
import { MpcService } from "@src/app/services/mpc.service";
import { ArtService } from "@src/app/services/art.service";
import { Song } from "mpc-js-web";


export interface SearchResult extends GridItem {
	artist?: string;
	art: string[];
}


export interface MopidySearchResult {
	uri: string;
	tracks: MopidyTrack[];
	artists: Array<{
		uri: string;
		name: string;
		sortname: string;
		musicbrainz_id: string;
	}>;
	albums: Array<{
		uri: string;
		name: string;
		artists:  Array<{
			uri: string;
			name: string;
			sortname: string;
			musicbrainz_id: string;
		}>;
		num_tracks: number | null;
		num_discs: number | null;
		date: string;
		musicbrainz_id: string;
	}>;
}


const PARSER_OPTIONS: parser.SearchParserOptions = {
	keywords: ["any", "uri", "title", "album", "artist", "albumartist", "genre", "date", "comment"],
	tokenize: true,
	alwaysArray: true,
	offsets: false,
};
const MPD_Tag_Map = {
	"any": "any",
	"uri": "file",
	"title": "Title",
	"album": "AlbumSort",
	"artist": "ArtistSort",
	"albumartist": "AlbumArtistSort",
	"genre": "Genre",
	"date": "Date",
	"comment": "Comment",
};


export class SearchResultsBase {
	public mopidy: boolean;
	public tracks: Track[];
	public albums: SearchResult[];
	public artists: SearchResult[];

	constructor(
		protected route: ActivatedRoute,
		protected mpc: MpcService,
		protected art: ArtService,
	) { }

	init(): void {
		this.route.queryParamMap.subscribe((params) => {
			const q = params.get("q");
			if (this.mopidy) {
				const query = { "any": [] };
				for (const [key, values] of Object.entries(parser.parse(q, PARSER_OPTIONS))) {
					if (key === "text" || key === "any") {
						if (values.length) {
							query["any"] = query["any"].concat(values);
						}
					} else if (key === "exclude") {
						// pass
					} else {
						query[key] = values;
					}
				}
				if (!query.any.length) {
					delete query.any;
				}
				this.mpc.socket.library.search([query]).then(async (results: MopidySearchResult[]) => {
					const tracks: Track[] = [];
					const albums: SearchResult[] = [];
					const artists: SearchResult[] = [];
					for (const result of results) {
						if (result.tracks) {
							for (const t of result.tracks) {
								try {
									tracks.push(track2track(t));
								} catch (e) {
									// pass
								}
							}
						}
						if (result.albums) {
							for (const al of result.albums) {
								try {
									albums.push({
										name: al.name,
										artist: al.artists[0].name,
										type: GridType.album,
										uri: al.uri,
										art: [],
									});
								} catch (e) {
									// pass
								}
							}
						}
						if (result.artists) {
							for (const ar of result.artists) {
								try {
									artists.push({
										name: ar.name,
										type: GridType.artist,
										uri: ar.uri,
										art: [],
									});
								} catch (e) {
									// pass
								}
							}
						}
					}
					// for (const album of albums) {
					// 	album.art = await this.art.getArt(album?.artist, album.name, true);
					// }
					// for (const artist of artists) {
					// 	artist.art = await this.art.getArt(artist?.name, null, true);
					// }
					this.tracks = tracks;
					this.albums = albums;
					this.artists = artists;
				});
			} else {
				const query = [];
				let queryAny = "";
				for (const [key, values] of Object.entries(parser.parse(q, PARSER_OPTIONS))) {
					if (key === "any" || key === "text") {
						queryAny += values.join(" ") + " ";
					} else if (key === "exclude") {
						// pass
					} else {
						query.push([key, values.join(" ")]);
					}
				}
				query.unshift(["any", queryAny.trim()]);
				this.mpc.socket.database.search(query).then((results: Song[]) => {
					this.tracks = results.map((s) => song2track(s));
				});
			}
		});
	}
}
