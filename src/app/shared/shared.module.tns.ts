import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { AccordionModule } from "nativescript-accordion/angular";

import { ConnectionComponent } from "@src/app/shared/components/connection/connection.component";
import { AlbumArtComponent } from "@src/app/shared/components/album-art/album-art.component";
import { PlaybackModalComponent } from "@src/app/shared/components/playback-modal/playback-modal.component";
import { AlbumListComponent } from "@src/app/shared/components/album-list/album-list.component";
import { AuthGuard } from "@src/app/shared/router/auth.guard";
import { AuthService } from "@src/app/shared/services/auth.service";

@NgModule({
	imports: [
		NativeScriptCommonModule,
		NativeScriptRouterModule,
		AccordionModule,
	],
	declarations: [
		ConnectionComponent,
		AlbumArtComponent,
		PlaybackModalComponent,
		AlbumListComponent,
		// PlaylistInputComponent,
	],
	entryComponents: [
		ConnectionComponent,
		PlaybackModalComponent,
	],
	providers: [
		AuthGuard,
		AuthService,
	],
	schemas: [
		NO_ERRORS_SCHEMA,
	],
	exports: [
		ConnectionComponent,
		AlbumArtComponent,
		PlaybackModalComponent,
		AlbumListComponent,
	],
})
export class SharedModule { }
