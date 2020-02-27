import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";


@Pipe({ name: "safe" })
export class SafePipe implements PipeTransform {
	constructor(private sanitizer: DomSanitizer) {}

	public transform(url) {
		return this.sanitizer.bypassSecurityTrustUrl(url);
	}
}


@Pipe({ name: "safeRes" })
export class SafeResourcePipe implements PipeTransform {
	constructor(private sanitizer: DomSanitizer) {}

	public transform(url) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}
}


@Pipe({ name: "safeStyle" })
export class SafeStylePipe implements PipeTransform {
	constructor(private sanitizer: DomSanitizer) {}

	public transform(url) {
		return this.sanitizer.bypassSecurityTrustStyle(url);
	}
}
