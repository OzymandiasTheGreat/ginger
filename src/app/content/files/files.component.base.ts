import { OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Event, NavigationEnd } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil, first } from "rxjs/operators";
import * as path from "path";
import { Song, Playlist, Directory, StoredPlaylist } from "mpc-js-web";

import { flattenUrl } from "@src/app/shared/functions/route";
import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { SearchService } from "@src/app/shared/services/search.service";


export class Files implements OnInit, OnDestroy {
	protected ngUnsubscribe: Subject<void>;

	public entries: Array<Song | Playlist | Directory>;
	public sorted: Array<Song | Playlist | Directory>;
	public playlists: StoredPlaylist[];

	constructor(
		private router: any,
		private route: ActivatedRoute,
		protected mpc: MPClientService,
		private search: SearchService,
	) {
		this.ngUnsubscribe = new Subject<void>();
	}

	public ngOnDestroy() {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	public ngOnInit() {
		this.loadDir(this.mpc.mopidy ? null : "/");
		this.mpc.stored.list()
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists);
		(this.router.router || this.router).events
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((event: Event) => {
				if (event instanceof NavigationEnd) {
					this.route.queryParamMap.subscribe((query) => {
						const uri = query.get("path") && decodeURIComponent(query.get("path"));
						this.loadDir(uri);
					});
				}
			});
		this.mpc.on("changed-stored_playlist")
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe(() => this.mpc.stored.list()
				.pipe(takeUntil(this.ngUnsubscribe))
				.subscribe((playlists: StoredPlaylist[]) => this.playlists = playlists));
	}

	public loadDir(uri: string) {
		this.mpc.db.listInfo(uri)
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((entries) => {
				this.entries = entries;
				this.sorted = [...this.entries];
				this.search.query
					.pipe(takeUntil(this.ngUnsubscribe))
					.subscribe((query) => {
						query = query.toLowerCase();
						this.entries = query.length > 0
							// tslint:disable-next-line:newline-per-chained-call
							? this.sorted.filter((entry) => entry && this.basename(entry.path).toLowerCase().includes(query))
							: [...this.sorted];
					});
			});
	}

	public navigate(uri: string) {
		(this.router.router || this.router).navigate([], {
			relativeTo: this.route,
			queryParams: { path: encodeURIComponent(uri) },
			queryParamsHandling: "merge",
		});
	}

	public basename(uri: string): string {
		return path.basename(decodeURIComponent(uri));
	}

	public play(uri: string, single: boolean) {
		if (!single) {
			this.mpc.current.clear();
		}
		this.mpc.current.add(uri, single)
			.pipe(first())
			.subscribe((id: number) => this.mpc.playback.play(id));
	}

	public add(uri: string) {
		this.mpc.current.add(uri, false);
	}
}
