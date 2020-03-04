import { OnInit, Input } from "@angular/core";
import { PlaylistItem, Song, StoredPlaylist } from "mpc-js-web";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { extractArtists, extractYear } from "@src/app/shared/functions/album-extract";


export class AlbumList {
	@Input() public queue    = false;
	@Input() public playlist = false;
	@Input() public artist   = false;
	@Input() public albums   = false;
	@Input() public genres   = false;
	@Input() public search   = false;
	@Input() public songs: any;
	@Input() public unsorted: any;
	@Input() public currentSong: PlaylistItem;
	@Input() public currentPlaylist: string;
	@Input() public albumArtist: string;
	@Input() public currentGenre: string;
}
