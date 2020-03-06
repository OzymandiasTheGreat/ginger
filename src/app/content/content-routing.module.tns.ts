import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { CurrentComponent } from "@src/app/content/current/current.component";
import { ArtistsComponent } from "@src/app/content/artists/artists.component";
import { ArtistComponent } from "@src/app/content/artist/artist.component";
import { PlaylistsComponent } from "@src/app/content/playlists/playlists.component";
import { PlaylistComponent } from "@src/app/content/playlist/playlist.component";
import { GenresComponent } from "@src/app/content/genres/genres.component";
import { GenreComponent } from "@src/app/content/genre/genre.component";
import { AlbumsComponent } from "@src/app/content/albums/albums.component";
import { FilesComponent } from "@src/app/content/files/files.component";
import { SearchComponent } from "@src/app/content/search/search.component";


const routes: Routes = [
	{ path: "queue", component: CurrentComponent },
	{ path: "artists", component: ArtistsComponent },
	{ path: "artists/:artist", component: ArtistComponent },
	{ path: "playlists", component: PlaylistsComponent },
	{ path: "playlists/:playlist", component: PlaylistComponent },
	{ path: "genres", component: GenresComponent },
	{ path: "genres/:genre", component: GenreComponent },
	{ path: "albums", component: AlbumsComponent },
	{ path: "files", component: FilesComponent, children: [
		{ path: "**", component: FilesComponent },
	] },
	{ path: "search", component: SearchComponent },
	{ path: "", redirectTo: "queue", pathMatch: "full"},
];

@NgModule({
	imports: [NativeScriptRouterModule.forChild(routes)],
	exports: [NativeScriptRouterModule],
})
export class ContentRoutingModule { }
