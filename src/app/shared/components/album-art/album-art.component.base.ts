import { Input } from "@angular/core";

import { ArtService } from "@src/app/shared/services/art.service";


export class AlbumArtBaseComponent {
	@Input() public artist: string | void;
	@Input() public album: string | void;
	@Input() public size: [number, number] = [64, 64];
	@Input() public large = false;
	@Input() public margin = true;
	@Input() public class: string | string[] | void;

	constructor(protected artService: ArtService) {}
}
