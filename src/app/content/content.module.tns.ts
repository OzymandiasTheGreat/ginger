import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";

import { SharedModule } from "@src/app/shared/shared.module";
import { ContentRoutingModule } from "@src/app/content/content-routing.module";
import { CurrentComponent } from "@src/app/content/current/current.component";
import { ArtistsComponent } from "@src/app/content/artists/artists.component";
import { ArtistComponent } from "@src/app/content/artist/artist.component";
import { PlaylistsComponent } from "@src/app/content/playlists/playlists.component";
import { PlaylistComponent } from "@src/app/content/playlist/playlist.component";
import { GenresComponent } from "@src/app/content/genres/genres.component";
import { AlbumsComponent } from "@src/app/content/albums/albums.component";
import { GenreComponent } from "@src/app/content/genre/genre.component";
import { FilesComponent } from "@src/app/content/files/files.component";
import { SearchComponent } from "@src/app/content/search/search.component";

@NgModule({
	imports: [
		NativeScriptCommonModule,
		ContentRoutingModule,
		SharedModule,
		NativeScriptUIListViewModule,
	],
	declarations: [
		CurrentComponent,
		ArtistsComponent,
		ArtistComponent,
		PlaylistsComponent,
		PlaylistComponent,
		GenresComponent,
		AlbumsComponent,
		GenreComponent,
		FilesComponent,
		SearchComponent,
	],
	providers: [
	],
	schemas: [
		NO_ERRORS_SCHEMA,
	]
})
export class ContentModule { }
