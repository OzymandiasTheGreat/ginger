import { Routes } from "@angular/router";

import { AuthGuard } from "@src/app/shared/router/auth.guard";
import { LayoutComponent } from "@src/app/layout/layout.component";


export const routes: Routes = [
	{
		path: "",
		component: LayoutComponent,
		children: [
			{
				path: "settings",
				// tslint:disable-next-line:newline-per-chained-call
				loadChildren: "./settings/settings.module#SettingsModule",
			},
			{
				path: "library",
				canLoad: [AuthGuard],
				// tslint:disable-next-line:newline-per-chained-call
				loadChildren: "./content/content.module#ContentModule",
			},
			{
				path: "",
				redirectTo: "library",
				pathMatch: "full",
			},
		],
	},
];
