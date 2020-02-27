import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";


@Component({
	selector: "app-playlist-input",
	templateUrl: "./playlist-input.component.html",
	styleUrls: ["./playlist-input.component.scss"]
})
export class PlaylistInputComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<PlaylistInputComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
	) {}

	public ngOnInit() {}

	public onSubmit(name: string) {
		this.dialogRef.close(name);
		return false;
	}
}
