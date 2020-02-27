import { ActivatedRouteSnapshot } from "@angular/router";


export function flattenUrl(routeChildren: ActivatedRouteSnapshot[]): string[] {
	return routeChildren.flatMap(
		(child) => [
			child.url.map((url) => url.path.split("/")),
			child.children.length > 0 ? flattenUrl(child.children) : [],
		],
	)
	.flat()
	.flat();
}
