import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { VirtualScrollerModule } from "ngx-virtual-scroller";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatListModule } from "@angular/material/list";
import { MatDividerModule } from "@angular/material/divider";
import { MatSelectModule } from "@angular/material/select";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatMenuModule } from "@angular/material/menu";
import { MatSliderModule } from "@angular/material/slider";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatCardModule } from "@angular/material/card";
import { MatGridListModule } from "@angular/material/grid-list";

import { SharedModule } from "@src/app/shared/shared.module";
import { SettingsRoutingModule } from "@src/app/settings/settings-routing.module";
import { ConnectComponent } from "@src/app/settings/connect/connect.component";


@NgModule({
	declarations: [ConnectComponent],
	imports: [
		CommonModule,
		FormsModule,
		SharedModule,
		SettingsRoutingModule,
		VirtualScrollerModule,
		MatIconModule,
		MatToolbarModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatSidenavModule,
		MatListModule,
		MatDividerModule,
		MatSelectModule,
		MatExpansionModule,
		MatButtonToggleModule,
		MatMenuModule,
		MatSliderModule,
		MatDialogModule,
		MatTooltipModule,
		MatCardModule,
		MatGridListModule,

	],
})
export class SettingsModule { }
