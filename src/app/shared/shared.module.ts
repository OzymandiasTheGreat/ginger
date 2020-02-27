import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { ScrollingModule } from "@angular/cdk/scrolling";
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
import { MatTooltipModule, MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from "@angular/material/tooltip";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardModule } from "@angular/material/card";

import { VirtualScrollerModule } from "ngx-virtual-scroller";

import { AuthGuard } from "./router/auth.guard";
import { AuthService } from "./services/auth.service";
import { CapitalizePipe } from "./pipes/capitalize.pipe";
import { SafePipe, SafeResourcePipe, SafeStylePipe } from "./pipes/safe.pipe";
import { AlbumListComponent } from "./components/album-list/album-list.component";
import { ConnectionComponent } from "./components/connection/connection.component";
import { AlbumArtComponent } from "./components/album-art/album-art.component";
import { PlaylistInputComponent } from "./components/playlist-input/playlist-input.component";
import { InputListenerDirective } from "./directives/input-listener.directive";


export const TOOLTIP_OPTIONS: MatTooltipDefaultOptions = {
	showDelay: 500,
	hideDelay: 1500,
	touchendHideDelay: 1500,
};


@NgModule({
	declarations: [
		CapitalizePipe,
		SafePipe,
		SafeResourcePipe,
		SafeStylePipe,
		AlbumListComponent,
		ConnectionComponent,
		AlbumArtComponent,
		PlaylistInputComponent,
		InputListenerDirective,
	],
	entryComponents: [
		ConnectionComponent,
		PlaylistInputComponent,
	],
	providers: [
		AuthGuard,
		AuthService,
		{ provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: TOOLTIP_OPTIONS },
	],
	imports: [
		CommonModule,
		RouterModule,
		FormsModule,
		HttpClientModule,
		ScrollingModule,
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
		MatProgressSpinnerModule,
		MatCardModule,
		VirtualScrollerModule,
	],
	exports: [
		CapitalizePipe,
		SafePipe,
		SafeResourcePipe,
		SafeStylePipe,
		AlbumArtComponent,
		AlbumListComponent,
		ConnectionComponent,
		PlaylistInputComponent,
		InputListenerDirective,
	],
})
export class SharedModule { }
