import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { SharedModule } from "@src/app/shared/shared.module";
import { SettingsRoutingModule } from "@src/app/settings/settings-routing.module";
import { ConnectComponent } from "@src/app/settings/connect/connect.component";


@NgModule({
	declarations: [ConnectComponent],
	imports: [
		NativeScriptCommonModule,
		NativeScriptFormsModule,
		SettingsRoutingModule,
		SharedModule,
	],
	schemas: [NO_ERRORS_SCHEMA],
})
export class SettingsModule { }
