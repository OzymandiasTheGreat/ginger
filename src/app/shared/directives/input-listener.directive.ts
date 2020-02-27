import { Directive, HostListener, Output, EventEmitter } from "@angular/core";

@Directive({
	selector: "[appInputListener]"
})
export class InputListenerDirective {
	@Output() public valueChanged: EventEmitter<string> = new EventEmitter<string>();

	constructor() { }

	@HostListener("input", ["$event.target.value"]) public onInput(value) {
		this.valueChanged.emit(value);
	}
}
