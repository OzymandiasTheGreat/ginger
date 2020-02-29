export interface ISideLink {
	title: string;
	icon: string;
	iconClass: string;
	path: string | null;
	type: "header" | "link";
}


export class Layout {
	public title = "Ginger";
	public sideLinks: ISideLink[] = [
		{ title: "Library", icon: "\uF333", iconClass: "mdi-library-music", path: null, type: "header" },
		{ title: "Now Playing", icon: "\u{F02A5}", iconClass: "mdi-play-box", path: "/library/queue", type: "link" },
		{ title: "Playlists", icon: "\uFC94", iconClass: "mdi-playlist-music", path: "/library/playlists", type: "link" },
		{ title: "Artists", icon: "\uF802", iconClass: "mdi-artist", path: "/library/artists", type: "link" },
		{ title: "Albums", icon: "\uF025", iconClass: "mdi-album", path: "/library/albums", type: "link" },
		{ title: "Genres", icon: "\uF386", iconClass: "mdi-music-circle", path: "/library/genres", type: "link" },
		{ title: "File System", icon: "\uF223", iconClass: "mdi-file-music", path: "/library/files", type: "link" },
		{ title: "Preferences", icon: "\uF8D5", iconClass: "mdi-cogs", path: null, type: "header" },
		{ title: "Connection", icon: "\uF59F", iconClass: "mdi-web", path: "/connect", type: "link" },
	];

	constructor() {}
}
