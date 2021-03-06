import { NgModule } from "@angular/core";
import { BrowserModule, DomSanitizer } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule } from "@angular/forms";

import { MatIconModule, MatIconRegistry } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatInputModule } from "@angular/material/input";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatButtonModule } from "@angular/material/button";
import { MatSliderModule } from "@angular/material/slider";
import { MatMenuModule } from "@angular/material/menu";
import { MatDialogModule } from "@angular/material/dialog";
import { MatCardModule } from "@angular/material/card";
import { MatTreeModule } from "@angular/material/tree";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ScrollingModule } from "@angular/cdk/scrolling";

import { VirtualScrollerModule } from "ngx-virtual-scroller";

import { AppRoutingModule } from "@src/app/app-routing.module";
import { AppComponent } from "@src/app/app.component";

import { ConnectionComponent } from "@src/app/connection/connection.component";
import { LayoutComponent } from "@src/app/layout/layout.component";
import { PlaybackComponent } from "@src/app/playback/playback.component";
import { TracklistComponent } from "@src/app/core/components/tracklist/tracklist.component";
import { QueueComponent } from "@src/app/queue/queue.component";
import { NewPlaylistComponent } from "@src/app/core/components/new-playlist/new-playlist.component";
import { PlaylistsComponent } from "@src/app/playlists/playlists.component";
import { BrowserGridComponent } from "@src/app/core/components/browser-grid/browser-grid.component";
import { PlaylistComponent } from "@src/app/playlist/playlist.component";
import { BrowserComponent } from "@src/app/browser/browser.component";
import { SearchResultsComponent } from "@src/app/search-results/search-results.component";


@NgModule({
	declarations: [
		AppComponent,
		ConnectionComponent,
		LayoutComponent,
		PlaybackComponent,
		TracklistComponent,
		QueueComponent,
		NewPlaylistComponent,
		PlaylistsComponent,
		BrowserGridComponent,
		PlaylistComponent,
		BrowserComponent,
		SearchResultsComponent,
	],
	entryComponents: [
		NewPlaylistComponent,
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		HttpClientModule,
		FormsModule,
		MatIconModule,
		MatSidenavModule,
		MatListModule,
		MatToolbarModule,
		MatInputModule,
		MatSlideToggleModule,
		MatButtonModule,
		MatSliderModule,
		MatMenuModule,
		MatDialogModule,
		MatCardModule,
		MatTreeModule,
		DragDropModule,
		ScrollingModule,
		VirtualScrollerModule,
		AppRoutingModule,
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {
	constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer) {
		matIconRegistry.addSvgIconSet(
			domSanitizer.bypassSecurityTrustResourceUrl("./assets/mdi.svg")
		);
	}
}
