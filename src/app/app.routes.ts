import { Routes } from "@angular/router";

import { LayoutComponent } from "@src/app/layout/layout.component";
import { ConnectionComponent } from "@src/app/connection/connection.component";
import { QueueComponent } from "@src/app/queue/queue.component";

export const routes: Routes = [
	{
		path: "",
		component: LayoutComponent,
		children: [
			{
				path: "",
				pathMatch: "full",
				redirectTo: "connect",
			},
			{
				path: "connect",
				component: ConnectionComponent,
			},
			{
				path: "queue",
				component: QueueComponent,
			},
		],
	},
];
