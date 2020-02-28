import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { VirtualScrollerModule } from "ngx-virtual-scroller";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatDividerModule } from "@angular/material/divider";
import { MatSelectModule } from "@angular/material/select";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatMenuModule } from "@angular/material/menu";
import { MatSliderModule } from "@angular/material/slider";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatCardModule } from "@angular/material/card";
import { MatGridListModule } from "@angular/material/grid-list";

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
	imports: [
		CommonModule,
		FormsModule,
		SharedModule,
		ContentRoutingModule,
		VirtualScrollerModule,
		MatIconModule,
		MatToolbarModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatSidenavModule,
		MatListModule,
		MatDividerModule,
		MatSelectModule,
		MatExpansionModule,
		MatButtonToggleModule,
		MatMenuModule,
		MatSliderModule,
		MatDialogModule,
		MatTooltipModule,
		MatCardModule,
		MatGridListModule,
	],
})
export class ContentModule { }
