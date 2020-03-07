import { Routes } from "@angular/router";

import { ConnectComponent } from "@src/app/settings/connect/connect.component";


export const routes: Routes = [
	{ path: "connect", component: ConnectComponent },
	{ path: "", redirectTo: "connect", pathMatch: "full" },
];
