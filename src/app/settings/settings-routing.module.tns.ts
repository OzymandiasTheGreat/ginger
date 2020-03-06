import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { ConnectComponent } from "@src/app/settings/connect/connect.component";


const routes: Routes = [
	{ path: "connect", component: ConnectComponent },
	{ path: "", redirectTo: "connect", pathMatch: "full" },
];


@NgModule({
	imports: [NativeScriptRouterModule.forChild(routes)],
	exports: [NativeScriptRouterModule],
})
export class SettingsRoutingModule { }
