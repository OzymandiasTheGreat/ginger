import { PlaylistItem, Song } from "mpc-js-web";

export function filterView(
	query: string,
	component: any,
) {
	const filtered = [...component.sorted];
	if (query.length > 0) {
		query = query.toLowerCase();
		component.songs = filtered.filter(([album, songs], index, array) => {
			return album && album.toLowerCase()
				.includes(query) || array[index][1].some((song) => {
					return (song.title && song.title.toLowerCase()
						.includes(query))
					|| (song.name && song.name.toLowerCase()
						.includes(query))
					|| (song.album && song.album.toLowerCase()
						.includes(query))
					|| (song.albumArtist && song.albumArtist.toLowerCase()
						.includes(query))
					|| (song.artist && song.artist.toLowerCase()
						.includes(query))
					|| (song.genre && song.genre.toLowerCase()
						.includes(query));
				});
		})
		.map(([album, songs]) => {
			// tslint:disable-next-line:newline-per-chained-call
			if (album && album.toLowerCase().includes(query)) {
				return [album, songs];
			}
			return [album, songs.filter((song) => {
				return (song.title && song.title.toLowerCase()
					.includes(query))
				|| (song.name && song.name.toLowerCase()
					.includes(query))
				|| (song.album && song.album.toLowerCase()
					.includes(query))
				|| (song.albumArtist && song.albumArtist.toLowerCase()
					.includes(query))
				|| (song.artist && song.artist.toLowerCase()
					.includes(query))
				|| (song.genre && song.genre.toLowerCase()
					.includes(query));
				}),
			];
		});
	} else {
		component.songs = [...component.sorted];
	}
}
