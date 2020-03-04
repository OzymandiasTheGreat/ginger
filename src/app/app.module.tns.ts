import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { AppRoutingModule } from "@src/app/app-routing.module.tns";
import { AppComponent } from "@src/app/app.component";

// import { BarcelonaModule } from "@src/app/barcelona/barcelona.module";
// import { AutoGeneratedComponent } from "@src/app/auto-generated/auto-generated.component";

// Uncomment and add to NgModule imports if you need to use two-way binding
import { NativeScriptFormsModule } from "nativescript-angular/forms";

// Uncomment and add to NgModule imports  if you need to use the HTTP wrapper
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";

import { NativeScriptUISideDrawerModule } from "nativescript-ui-sidedrawer/angular";
import { TNSImageCacheItModule } from "nativescript-image-cache-it/angular";
import { AccordionModule } from "nativescript-accordion/angular";

import { SharedModule } from "@src/app/shared/shared.module";
import { LayoutComponent } from "@src/app/layout/layout.component";
import { PlaybackComponent } from "@src/app/playback/playback.component";
import { ConnectComponent } from "@src/app/connect/connect.component";


@NgModule({
	declarations: [
		AppComponent,
		// AutoGeneratedComponent,
		LayoutComponent,
		PlaybackComponent,
		ConnectComponent,
	],
	imports: [
		NativeScriptModule,
		NativeScriptRouterModule,
		AppRoutingModule,
		NativeScriptFormsModule,
		NativeScriptHttpClientModule,
		// BarcelonaModule,
		NativeScriptUISideDrawerModule,
		TNSImageCacheItModule,
		AccordionModule,
		SharedModule,
	],
	providers: [],
	bootstrap: [AppComponent],
	schemas: [NO_ERRORS_SCHEMA]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule { }
