import { PlaylistItem, Song } from "mpc-js-web";

export function filterView(
	query: string,
	component: any,
) {
	const filtered = [...component.sorted];
	if (query.length > 0) {
		query = query.toLowerCase();
		component.songs = filtered.filter(({ artist, title, items }, index, array) => {
			return title && title.toLowerCase()
				.includes(query) || array[index].items.some((song) => {
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
		.map(({ artist, title, items }) => {
			// tslint:disable-next-line:newline-per-chained-call
			if (title && title.toLowerCase().includes(query)) {
				return { artist, title, items };
			}
			return { artist, title, items: items.filter((song) => {
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
			};
		});
	} else {
		component.songs = [...component.sorted];
	}
}
