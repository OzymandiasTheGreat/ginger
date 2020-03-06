import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AuthGuard } from "@src/app/shared/router/auth.guard";


const routes: Routes = [
	// tslint:disable-next-line:newline-per-chained-call
	{ path: "settings", loadChildren: () => import("@src/app/settings/settings.module").then((m) => m.SettingsModule) },
	// tslint:disable-next-line:newline-per-chained-call
	{ path: "library", canLoad: [AuthGuard], loadChildren: () => import("@src/app/content/content.module").then((m) => m.ContentModule) },
	{ path: "", redirectTo: "library/queue", pathMatch: "full" },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
