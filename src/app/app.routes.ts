import { Routes } from "@angular/router";

import { LayoutComponent } from "@src/app/layout/layout.component";
import { ConnectionComponent } from "@src/app/connection/connection.component";
import { QueueComponent } from "@src/app/queue/queue.component";
import { PlaylistsComponent } from "@src/app/playlists/playlists.component";
import { PlaylistComponent } from "@src/app/playlist/playlist.component";
import { BrowserComponent } from "@src/app/browser/browser.component";
import { SearchResultsComponent } from "@src/app/search-results/search-results.component";


export const routes: Routes = [
	{
		path: "",
		component: LayoutComponent,
		children: [
			{
				path: "",
				pathMatch: "full",
				redirectTo: "connect",
			},
			{
				path: "connect",
				component: ConnectionComponent,
			},
			{
				path: "queue",
				component: QueueComponent,
			},
			{
				path: "playlists",
				component: PlaylistsComponent,
			},
			{
				path: "playlists/:id",
				component: PlaylistComponent,
			},
			{
				path: "browse",
				component: BrowserComponent,
			},
			{
				path: "search",
				component: SearchResultsComponent,
			},
		],
	},
];
