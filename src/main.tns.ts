// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { platformNativeScriptDynamic } from "nativescript-angular/platform";

import { registerElement } from "nativescript-angular/element-registry";

import { AppModule } from "@src/app/app.module";

// WebSocket Support
// tslint:disable-next-line:no-require-imports
require("nativescript-websockets");

// Image Caching
import { ImageCacheIt } from "nativescript-image-cache-it";
ImageCacheIt.enableAutoMM();

// FAB
import { Fab } from "@nstudio/nativescript-floatingactionbutton";
registerElement("FAB", () => Fab);

// A traditional NativeScript application starts by initializing global objects,
// setting up global CSS rules, creating, and navigating to the main page.
// Angular applications need to take care of their own initialization: modules, components, directives, routes, DI providers.
// A NativeScript Angular app needs to make both paradigms work together,
// so we provide a wrapper platform object, platformNativeScriptDynamic,
// that sets up a NativeScript application and can bootstrap the Angular framework.
platformNativeScriptDynamic()
	.bootstrapModule(AppModule);
