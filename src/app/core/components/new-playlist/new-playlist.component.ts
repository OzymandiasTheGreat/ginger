import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";


@Component({
	selector: "app-new-playlist",
	templateUrl: "./new-playlist.component.html",
})
export class NewPlaylistComponent {
	constructor(
		public dialogRef: MatDialogRef<NewPlaylistComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { name: string },
	) { }

	cancel(): void {
		this.dialogRef.close();
	}
}
