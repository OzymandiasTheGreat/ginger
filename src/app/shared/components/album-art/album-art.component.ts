import { Component, OnChanges, SimpleChanges, Input, ViewChild, ElementRef } from "@angular/core";

import { ArtService } from "../../services/art.service";


@Component({
	selector: "app-album-art",
	templateUrl: "./album-art.component.html",
	styleUrls: ["./album-art.component.scss"]
})
export class AlbumArtComponent implements OnChanges {
	@ViewChild("wrapper", { static: true }) private wrapper: ElementRef;
	@ViewChild("art", { static: true }) private art: ElementRef;
	@ViewChild("fallback", { static: true }) private fallback: ElementRef;
	@Input() public artist: string;
	@Input() public album: string;
	@Input() public size: [number, number] = [64, 64];
	@Input() public large = false;
	@Input() public margin = true;
	@Input() public class: string | string[] = "";

	public src: string;

	constructor(private artService: ArtService) {}

	public ngOnChanges(changes: SimpleChanges) {
		const artElem = <HTMLImageElement> this.art.nativeElement;
		const fallbackElem = <HTMLImageElement> this.fallback.nativeElement;

		if (!("src" in changes)) {
			if (this.artist && this.artist.length < 1) {
				artElem.classList.add("album-art");
				fallbackElem.classList.add("album-art");
			} else {
				artElem.classList.add(this.album ? "album-art" : "artist-art");
				fallbackElem.classList.add(this.album ? "album-art" : "artist-art");
			}
			if (this.class) {
				if (typeof this.class === "string") {
					artElem.classList.add(this.class);
					fallbackElem.classList.add(this.class);
				} else {
					artElem.classList.add(...this.class);
					fallbackElem.classList.add(...this.class);
				}
			}
			this.artService.getArt(this.artist, this.album, this.large)
				.subscribe((urls) => {
					const values = urls.map((url) => `url("${url}")`);
					this.src = values.join(", ");
				});
		}
	}
}
