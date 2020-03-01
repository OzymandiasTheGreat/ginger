import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { ConnectionComponent } from "@src/app/shared/components/connection/connection.component";
import { AlbumArtComponent } from "@src/app/shared/components/album-art/album-art.component";
// import { AlbumListComponent } from "@src/app/shared/components/album-list/album-list.component";
// import { PlaylistInputComponent } from "@src/app/shared/components/playlist-input/playlist-input.component";
import { AuthGuard } from "@src/app/shared/router/auth.guard";
import { AuthService } from "@src/app/shared/services/auth.service";

@NgModule({
	imports: [
		NativeScriptCommonModule
	],
	declarations: [
		ConnectionComponent,
		AlbumArtComponent,
		// AlbumListComponent,
		// PlaylistInputComponent,
	],
	entryComponents: [
		ConnectionComponent,
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
	],
})
export class SharedModule { }
