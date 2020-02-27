import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

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
import { MatGridListModule } from "@angular/material/grid-list";

import { SharedModule } from "./shared/shared.module";
import { LoginComponent } from "./components/login/login.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { PlaybackComponent } from "./components/playback/playback.component";


export const TOOLTIP_OPTIONS: MatTooltipDefaultOptions = {
	showDelay: 500,
	hideDelay: 1500,
	touchendHideDelay: 1500,
};


@NgModule({
	declarations: [
		LoginComponent,
		AppComponent,
		NavbarComponent,
		PlaybackComponent,
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		CommonModule,
		BrowserAnimationsModule,
		FormsModule,
		SharedModule,
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
		MatGridListModule,
	],
	providers: [
		{ provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: TOOLTIP_OPTIONS },
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
