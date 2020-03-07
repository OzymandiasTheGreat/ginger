export interface ISideLink {
	title: string;
	icon: string;
	iconClass: string;
	path: string | null;
}


export interface ISideHeader {
	title: string;
	icon: string;
	iconClass: string;
	items: ISideLink[];
}


export class Layout {
	public title = "Ginger";
	public links: ISideHeader[] = [
		{ title: "Library", icon: "\uF333", iconClass: "mdi-library-music", items: [
			{ title: "Now Playing", icon: "\u{F02A5}", iconClass: "mdi-play-box", path: "/library/queue" },
			{ title: "Playlists", icon: "\uFC94", iconClass: "mdi-playlist-music", path: "/library/playlists" },
			{ title: "Artists", icon: "\uF802", iconClass: "mdi-artist", path: "/library/artists" },
			{ title: "Albums", icon: "\uF025", iconClass: "mdi-album", path: "/library/albums" },
			{ title: "Genres", icon: "\uF386", iconClass: "mdi-music-circle", path: "/library/genres" },
			{ title: "File System", icon: "\uF223", iconClass: "mdi-file-music", path: "/library/files" },
		] },
		{ title: "Preferences", icon: "\uF8D5", iconClass: "mdi-cogs", items: [
			{ title: "Connection", icon: "\uF59F", iconClass: "mdi-web", path: "/settings/connect" },
		] },
	];

	constructor() {}
}
