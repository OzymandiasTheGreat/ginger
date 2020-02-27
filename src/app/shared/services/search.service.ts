import { Injectable } from "@angular/core";
import { Router, Event, NavigationStart} from "@angular/router";
import { Observable, BehaviorSubject } from "rxjs";

@Injectable({
	providedIn: "root"
})
export class SearchService {
	private subject: BehaviorSubject<string> = new BehaviorSubject("");
	public query: Observable<string> = this.subject.asObservable();

	constructor(private router: Router) {
		this.router.events.subscribe((event: Event) => {
			if (event instanceof NavigationStart) {
				this.subject.next("");
			}
		});
	}

	public updateQuery(query: string): void {
		this.subject.next(query);
	}
}
