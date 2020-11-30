import { MopidyTrack } from "@src/app/types/track";


export interface MopidyPlaylist {
	last_modified: number | null;
	length: number;
	name: string;
	tracks: MopidyTrack[];
	uri: string;
}


export interface Playlist {
	uri: string;
	name: string;
}
