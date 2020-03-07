import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { routes } from "@src/app/settings/settings-routing.module.base";

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class SettingsRoutingModule { }
