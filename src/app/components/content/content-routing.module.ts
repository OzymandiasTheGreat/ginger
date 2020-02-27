import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { CurrentComponent } from "./current/current.component";
import { ArtistsComponent } from "./artists/artists.component";
import { ArtistComponent } from "./artist/artist.component";
import { PlaylistsComponent } from "./playlists/playlists.component";
import { PlaylistComponent } from "./playlist/playlist.component";
import { GenresComponent } from "./genres/genres.component";
import { GenreComponent } from "./genre/genre.component";
import { AlbumsComponent } from "./albums/albums.component";
import { FilesComponent } from "./files/files.component";
import { SearchComponent } from "./search/search.component";


const routes: Routes = [
	{ path: "", redirectTo: "queue", pathMatch: "full"},
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
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ContentRoutingModule { }
