import { PlaylistItem, Song } from "mpc-js-web";

import { Track, MopidyTrack, TlTrack } from "@src/app/types/track";


export function track2track(track: MopidyTrack): Track {
	return {
		uri: track.uri,
		title: track.name,
		album: {
			id: track.album.uri,
			title: track.album.name,
		},
		albumArtist: {
			id: track.artists[0].uri,
			title: track.artists[0].name,
		},
		artist: {
			id: track.artists[0].uri,
			title: track.artists.map((a) => a.name).join(", "),
		},
		genre: track.genre,
		date: track.date,
		track_no: track.track_no,
		disc_no: track.disc_no,
		art: [],
		id: null,
	};
}


export function tlTrack2track(tlTrack: TlTrack): Track {
	const track = track2track(tlTrack.track);
	track.id = tlTrack.tlid;
	return track;
}


export function playlistItem2track(item: PlaylistItem): Track {
	return {
		id: item.id,
		uri: item.path,
		title: item.title || item.name,
		album: {
			id: item.album,
			title: item.album,
		},
		albumArtist: {
			id: item.albumArtist,
			title: item.albumArtist,
		},
		artist: {
			id: item.artist,
			title: item.artist,
		},
		genre: item.genre,
		date: item.date,
		track_no: item.track,
		disc_no: null,
		art: [],
	};
}


export function song2track(song: Song): Track {
	return {
		id: null,
		uri: song.path,
		title: song.title || song.name,
		album: {
			id: song.album,
			title: song.album,
		},
		albumArtist: {
			id: song.albumArtist,
			title: song.albumArtist,
		},
		artist: {
			id: song.artist,
			title: song.artist,
		},
		genre: song.genre,
		date: song.date,
		track_no: song.track,
		disc_no: song.disc,
		art: [],
	};
}
