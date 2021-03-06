import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "@nativescript/angular";
import { registerElement } from "@nativescript/angular";
import { Application } from "@nativescript/core";

import { NativeScriptUISideDrawerModule } from "nativescript-ui-sidedrawer/angular";
import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";
import { TNSImageModule } from "@nativescript-community/ui-image/angular";
import * as imageModule from "@nativescript-community/ui-image";
import { CardView } from "@nstudio/nativescript-cardview";

import { AppRoutingModule } from "@src/app/app-routing.module";
import { AppComponent } from "@src/app/app.component";
import { ConnectionComponent } from "@src/app/connection/connection.component";
import { LayoutComponent } from "@src/app/layout/layout.component";

// Uncomment and add to NgModule imports if you need to use two-way binding and/or HTTP wrapper
import { NativeScriptFormsModule, NativeScriptHttpClientModule } from "@nativescript/angular";
import { PlaybackComponent } from "@src/app/playback/playback.component";
import { TracklistComponent } from "@src/app/core/components/tracklist/tracklist.component";
import { QueueComponent } from "@src/app/queue/queue.component";
import { PlaylistsComponent } from "@src/app/playlists/playlists.component";
import { BrowserGridComponent } from "@src/app/core/components/browser-grid/browser-grid.component";
import { PlaylistComponent } from "@src/app/playlist/playlist.component";
import { BrowserComponent } from "@src/app/browser/browser.component";
import { SearchResultsComponent } from "@src/app/search-results/search-results.component";


if (Application.android) {
	Application.on(Application.launchEvent, () => {
		imageModule.initialize();
	});
}


registerElement(
	"FAB",
	() => require("@nstudio/nativescript-floatingactionbutton").Fab,
);
registerElement("CardView", () => CardView);


@NgModule({
	declarations: [
		AppComponent,
		ConnectionComponent,
		LayoutComponent,
		PlaybackComponent,
		TracklistComponent,
		QueueComponent,
		PlaylistsComponent,
		BrowserGridComponent,
		PlaylistComponent,
		BrowserComponent,
		SearchResultsComponent,
	],
	imports: [
		NativeScriptModule,
		NativeScriptFormsModule,
		NativeScriptHttpClientModule,
		NativeScriptUISideDrawerModule,
		NativeScriptUIListViewModule,
		TNSImageModule,
		AppRoutingModule,
	],
	providers: [],
	bootstrap: [AppComponent],
	schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
