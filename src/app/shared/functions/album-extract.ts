import { PlaylistItem, Song } from "mpc-js-web";


export function extractArtists(songs: Array<PlaylistItem | Song>): string {
	const artists = songs.reduce((acc, song) => {
		if (!acc.includes(song.albumArtist)) {
			acc.push(song.albumArtist);
		}
		return acc;
	}, []);
	return artists.join(", ");
}

export function extractYear(songs: Array<PlaylistItem | Song>): Date {
	return songs.reduce((acc, song) => {
		const songDate = new Date(song.date);
		if (acc.getTime() > songDate.getTime()) {
			return acc;
		}
		return songDate;
	}, new Date(-8640000000000000));
}
