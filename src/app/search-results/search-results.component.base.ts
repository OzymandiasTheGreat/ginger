import { ActivatedRoute } from "@angular/router";
import * as parser from "search-query-parser";

import { MopidyTrack, Track } from "@src/app/types/track";
import { track2track } from "@src/app/functions/track";
import { GridItem, GridType } from "@src/app/core/components/browser-grid/browser-grid.component.base";
import { MpcService } from "@src/app/services/mpc.service";
import { ArtService } from "@src/app/services/art.service";


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
						query["any"] = query["any"].concat(values);
					} else {
						query[key] = values;
					}
				}
				this.mpc.socket.library.search([query]).then(async (results: MopidySearchResult[]) => {
					let tracks: Track[] = [];
					let albums: SearchResult[] = [];
					let artists: SearchResult[] = [];
					for (const result of results) {
						tracks = tracks.concat(result.tracks.map((t) => track2track(t)));
						albums = albums.concat(result.albums.map((a) => ({
							name: a.name,
							artist: a.artists[0].name,
							type: GridType.album,
							uri: a.uri,
							art: [],
						})));
						artists = artists.concat(result.artists.map((a) => ({
							name: a.name,
							type: GridType.artist,
							uri: a.uri,
							art: [],
						})));
					}
					for (const album of albums) {
						album.art = await this.art.getArt(album.artist, album.name, true);
					}
					for (const artist of artists) {
						artist.art = await this.art.getArt(artist.name, null, true);
					}
				});
			}
		});
	}
}
