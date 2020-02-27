import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "capitalize"
})
export class CapitalizePipe implements PipeTransform {

	public transform(value: string): string {
		return value.split(/\s/)
			.map((substr) => `${substr.slice(0, 1)
				.toUpperCase()}${substr.slice(1)}`)
			.join(" ");
	}

}
