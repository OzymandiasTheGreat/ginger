import * as webpack from "webpack";


export default {
	plugins: [
		new webpack.DefinePlugin({
			SPOTIFY_CLIENT_ID: JSON.stringify(process.env.SPOTIFY_CLIENT_ID),
			SPOTIFY_CLIENT_SECRET: JSON.stringify(process.env.SPOTIFY_CLIENT_SECRET),
			LASTFM_API_KEY: JSON.stringify(process.env.LASTFM_API_KEY),
		}),
	]
} as webpack.Configuration;
