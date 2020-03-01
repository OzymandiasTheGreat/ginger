import { Component, OnChanges, SimpleChanges, ViewChild, ElementRef } from "@angular/core";
import { Image } from "tns-core-modules/ui/image";
import { ImageCacheIt } from "nativescript-image-cache-it";

import { ArtService } from "@src/app/shared/services/art.service";
import { AlbumArtBaseComponent } from "@src/app/shared/components/album-art/album-art.component.base";


@Component({
	selector: "app-album-art",
	templateUrl: "./album-art.component.html",
	styleUrls: ["./album-art.component.scss"],
})
export class AlbumArtComponent extends AlbumArtBaseComponent implements OnChanges {
	@ViewChild("image", { static: true }) private image: ElementRef<ImageCacheIt>;
	@ViewChild("fallback", { static: true }) private fallback: ElementRef<ImageCacheIt>;
	@ViewChild("placeholder", { static: true }) private placeholder: ElementRef<Image>;

	constructor(artService: ArtService) {
		super(artService);
	}

	public ngOnChanges(changes: SimpleChanges) {
		const image = this.image.nativeElement;
		const fallback = this.fallback.nativeElement;
		const placeholder = this.placeholder.nativeElement;
		if (!("placeholder" in changes) && !("placeholder" in changes) && !("errorholder" in changes)) {
			if (this.artist) {
				if (this.album) {
					image.cssClasses.add("album-art");
					fallback.cssClasses.add("album-art");
					placeholder.cssClasses.add("album-art");
					placeholder.src = "font://\uF025";
				} else {
					image.cssClasses.add("artist-art");
					fallback.cssClasses.add("artist-art");
					placeholder.cssClasses.add("artist-art");
					placeholder.src = "font://\uF802";
				}
			} else {
				image.cssClasses.add("album-art");
				fallback.cssClasses.add("album-art");
				placeholder.cssClasses.add("album-art");
				placeholder.src = "font://\uF025";
			}
			if (this.class) {
				if (typeof this.class === "string") {
					image.cssClasses.add(this.class);
					fallback.cssClasses.add(this.class);
					placeholder.cssClasses.add(this.class);
				} else {
					this.class.forEach((cls: string) => {
						image.cssClasses.add(cls);
						fallback.cssClasses.add(cls);
						placeholder.cssClasses.add(cls);
					});
				}
			}
			this.artService.getArt(this.artist, this.album, this.large)
				.subscribe((urls) => {
					image.src = urls[0];
					fallback.src = urls[1];
				});
		}
	}
}
