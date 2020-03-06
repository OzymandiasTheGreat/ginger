import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { ConnectComponent } from "@src/app/settings/connect/connect.component";


const routes: Routes = [
	{ path: "connect", component: ConnectComponent },
	{ path: "", redirectTo: "connect", pathMatch: "full" },
];


@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SettingsRoutingModule { }
