export interface Track {
	id: string | number;
	uri: string;
	title: string;
	artist: {
		title: string,
		id: string,
	};
	albumArtist: {
		title: string,
		id: string,
	};
	album: {
		title: string,
		id: string,
	};
	genre: string;
	track_no: number | string;
	disc_no: number | string;
	date: string;
	art: string[];
}

export interface TlTrack {
	tlid: number;
	track: MopidyTrack;
}

export interface MopidyTrack {
	uri: string;
	name: string;
	artists: Array<{
		uri: string;
		name: string;
		sortname: string;
		musicbrainz_id: string;
	}>;
	album: {
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
	};
	composers:  Array<{
		uri: string;
		name: string;
		sortname: string;
		musicbrainz_id: string;
	}>;
	performers:  Array<{
		uri: string;
		name: string;
		sortname: string;
		musicbrainz_id: string;
	}>;
	genre: string;
	track_no: number | null;
	disc_no: number | null;
	date: string;
	length: number | null;
	bitrate: number;
	comment: string;
	musicbrainz_id: string;
	last_modified: number | null;
}
