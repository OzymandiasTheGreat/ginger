import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AuthGuard } from "@src/app/shared/router/auth.guard";
import { ConnectComponent } from "@src/app/connect/connect.component";


const routes: Routes = [
	{ path: "connect", component: ConnectComponent },
	{ path: "", redirectTo: "connect", pathMatch: "full" },
	{ path: "library", canLoad: [AuthGuard], loadChildren: () => import("@src/app/content/content.module").then((m) => m.ContentModule) },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
