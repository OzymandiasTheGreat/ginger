import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { routes } from "@src/app/app-routing.module.base";


@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
