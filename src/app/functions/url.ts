export function buildQuery(url: string, params: {}) {
	let query = "";
	for (const key in params) {
		if (params.hasOwnProperty(key)) {
			const value = params[key];
			query += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
		}
	}
	if (query.length > 0) {
		query = query.substring(0, query.length - 1);  // chop off last "&"
		return `${url}?${query}`;
	}
	return url;
}
