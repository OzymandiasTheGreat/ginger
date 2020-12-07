import { Injectable } from "@angular/core";
import { ApplicationSettings, Device, Application, Utils, path, knownFolders } from "@nativescript/core";
import Mopidy from "mopidy";
import { MPC, Song } from "mpc-js-web";

import { MpcService } from "@src/app/services/mpc.service";
import { ArtService } from "@src/app/services/art.service";
import { CURRENT_CONNECTION_ADDRESS, CURRENT_CONNECTION_PASSWORD, CURRENT_MOPIDY } from "@src/app/types/constants";
import { MopidyTrack } from "@src/app/types/track";


export const PLATFORM_SERVICE_CLASSNAME = "tk.ozymandias.ginger.PlatformService";
export const RESTART_RECEIVER_CLASSNAME = "tk.ozymandias.ginger.RestartReceiver";
export const PLAYBACK_RECEIVER_CLASSNAME = "tk.ozymandias.ginger.PlaybackReceiver";


export interface StrippedTrack {
	title: string;
	album: string;
	artist: string;
	art: android.graphics.Bitmap;
}


@JavaProxy("tk.ozymandias.ginger.PlatformService")
export class NativePlatformService extends android.app.Service {
	public art: ArtService;
	public socket: Mopidy | MPC;
	public mopidy: boolean;
	public address: string;
	public password: string;
	public session: android.support.v4.media.session.MediaSessionCompat;

	onBind(): android.os.IBinder {
		return null;
	}

	onCreate(): void {
		super.onCreate();
		this.mopidy = ApplicationSettings.getBoolean(CURRENT_MOPIDY);
		this.address = ApplicationSettings.getString(CURRENT_CONNECTION_ADDRESS, null);
		this.password = ApplicationSettings.getString(CURRENT_CONNECTION_PASSWORD, null);
		if (this.address) {
			this.socket = this.mopidy
				? new Mopidy({ webSocketUrl: this.address, autoConnect: false })
				: new MPC();
			this.art = new ArtService();
			this.session = new android.support.v4.media.session.MediaSessionCompat(this, "RemotePlaybackSession");

			const CHANNEL_ID = "persistence";
			const CHANNEL_NAME = "Background service";
			const CHANNEL_DESC = "Mandatory notification for background service";

			const notificationManager = this.getSystemService(android.content.Context.NOTIFICATION_SERVICE);
			if (Device.sdkVersion >= "26") {
				let mChannel = notificationManager.getNotificationChannel(CHANNEL_ID);
				if (mChannel === null) {
					mChannel = new android.app.NotificationChannel(
						CHANNEL_ID,
						CHANNEL_NAME,
						android.app.NotificationManager.IMPORTANCE_LOW,
					);
					mChannel.description = CHANNEL_DESC;
					notificationManager.createNotificationChannel(mChannel);
				}
			}
			const builder = new androidx.core.app.NotificationCompat.Builder(Application.android.context, CHANNEL_ID);
			builder
				.setSmallIcon(Utils.ad.resources.getDrawableId("ginger_mono"))
				.setContentText("You can safely hide this notification")
				.setContentTitle("ginger is running")
				.setVisibility(androidx.core.app.NotificationCompat.VISIBILITY_SECRET);
			this.startForeground(8, builder.build());
		}
	}

	onStartCommand(intent: android.content.Intent, flags: number, startId: number): number {
		if (this.address) {
			if (this.mopidy) {
				this.socket.connect();
				this.mopidySetup().then(({ track, playing }) => this.mediaNotify(track, playing));
				this.socket.on("event:playbackStateChanged", () => {
					this.mopidySetup().then(({ track, playing }) => this.mediaNotify(track, playing));
				});
				this.socket.on("event:trackPlaybackStarted", () => {
					this.mopidySetup().then(({ track, playing }) => this.mediaNotify(track, playing));
				});
			} else {
				this.socket.connectWebSocket(this.address);
				if (this.password) {
					this.socket.connection.password(this.password);
				}
				this.mpdSetup().then(({ track, playing }) => this.mediaNotify(track, playing));
				this.socket.on("changed-player", () => this.mpdSetup().then(({ track, playing }) => this.mediaNotify(track, playing)));
			}
			return android.app.Service.START_REDELIVER_INTENT;
		}
		return android.app.Service.START_NOT_STICKY;
	}

	onDestroy(): void {
		super.onDestroy();
		if (this.session) {
			this.session.setActive(false);
			this.session.release();
		}
		if (this.address) {
			const restartIntent = new android.content.Intent();
			restartIntent.setClassName(this, RESTART_RECEIVER_CLASSNAME);
			this.sendBroadcast(restartIntent);
		}
	}

	onTaskRemoved(intent: android.content.Intent): void {
		this.stopSelf();
	}

	mopidySetup(): Promise<{ track: StrippedTrack, playing: boolean }> {
		return Promise.all([
			this.socket.playback.getState(),
			this.socket.playback.getCurrentTrack(),
		]).then(([state, track]: [string, MopidyTrack]) => {
			if (track) {
				return this.art.getArt(track.artists[0].name, track.album.name, true).then((arts) => {
					let art: android.graphics.Bitmap;
					if (arts.length) {
						art = android.graphics.BitmapFactory.decodeFile(arts[1] || arts[0]);
					} else {
						const bitmap = android.graphics.Bitmap.createBitmap(720, 720, android.graphics.Bitmap.Config.ARGB_8888);
						const canvas = new android.graphics.Canvas(bitmap);
						const paint = new android.graphics.Paint();
						const typeface = android.graphics.Typeface.createFromFile(
							path.join(knownFolders.currentApp().path, "fonts/materialdesignicons.ttf"));
						canvas.drawColor(android.graphics.Color.parseColor("#212121"));
						paint.setAntiAlias(true);
						paint.setSubpixelText(true);
						paint.setTypeface(typeface);
						paint.setStyle(android.graphics.Paint.Style.FILL);
						paint.setColor(android.graphics.Color.WHITE);
						paint.setTextSize(700);
						canvas.drawText("\uF025;", 10, 620, paint);
						art = bitmap;
					}
					return {
						track: {
							title: track.name,
							album: track.album.name,
							artist: track.artists.map((a) => a.name).join(", "),
							art,
						},
						playing: state === "playing",
					};
				});
			}
			return { track: { title: null, album: null, artist: null, art: null }, playing: state === "playing" };
		});
	}

	mpdSetup(): Promise<{ track: StrippedTrack, playing: boolean }> {
		return Promise.all([
			this.socket.status.status(),
			this.socket.status.currentSong(),
		]).then(([song, { state }]: [Song, any ]) => {
			if (song) {
				return this.art.getArt(song.artist, song.album, true).then((arts) => {
					let art: android.graphics.Bitmap;
					if (arts.length) {
						art = android.graphics.BitmapFactory.decodeFile(arts[1] || arts[0]);
					} else {
						const bitmap = android.graphics.Bitmap.createBitmap(720, 720, android.graphics.Bitmap.Config.ARGB_8888);
						const canvas = new android.graphics.Canvas(bitmap);
						const paint = new android.graphics.Paint();
						const typeface = android.graphics.Typeface.createFromFile(
							path.join(knownFolders.currentApp().path, "fonts/materialdesignicons.ttf"));
						canvas.drawColor(android.graphics.Color.parseColor("#212121"));
						paint.setAntiAlias(true);
						paint.setSubpixelText(true);
						paint.setTypeface(typeface);
						paint.setStyle(android.graphics.Paint.Style.FILL);
						paint.setColor(android.graphics.Color.WHITE);
						paint.setTextSize(700);
						canvas.drawText("\uF025;", 10, 620, paint);
						art = bitmap;
					}
					return {
						track: {
							title: song.title || song.name,
							album: song.album,
							artist: song.artist,
							art,
						},
						playing: state === "play",
					};
				});
			}
			return { track: { title: null, album: null, artist: null, art: null }, playing: state === "play" };
		});
	}

	mediaNotify(track: StrippedTrack, playing: boolean): void {
		const NOTIFICATION_ID = 12;
		const CHANNEL_ID = "remote_playback";
		const CHANNEL_NAME = "Remote Playback";
		const CHANNEL_DESC = "Remote playback notifications";
		const notificationManager = this.getSystemService(android.content.Context.NOTIFICATION_SERVICE);

		if (Device.sdkVersion >= "26") {
			let mChannel = notificationManager.getNotificationChannel(CHANNEL_ID);
			if (mChannel === null) {
				mChannel = new android.app.NotificationChannel(
					CHANNEL_ID,
					CHANNEL_NAME,
					android.app.NotificationManager.IMPORTANCE_LOW,
				);
				mChannel.description = CHANNEL_DESC;
				notificationManager.createNotificationChannel(mChannel);
			}
		}

		const builder = new androidx.core.app.NotificationCompat.Builder(this, CHANNEL_ID);
		const intent = new android.content.Intent(this, (<any> com).tns.NativeScriptActivity.class);
		const pendingIntent = android.app.PendingIntent.getActivity(this, 0, intent, 0);

		builder
			.setContentTitle(track.title)
			.setContentText(track.artist)
			.setSmallIcon(Utils.ad.resources.getDrawableId("ginger_mono"))
			.setContentIntent(pendingIntent)
			.setVisibility(androidx.core.app.NotificationCompat.VISIBILITY_PUBLIC)
			.setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
				.setMediaSession(this.session.getSessionToken())
				.setShowActionsInCompactView([0, 1, 2]));
		this.addActions(builder, playing);

		const metadata = new android.support.v4.media.MediaMetadataCompat.Builder();
		metadata.putBitmap(android.support.v4.media.MediaMetadataCompat.METADATA_KEY_ALBUM_ART, track.art);
		metadata.putString(android.support.v4.media.MediaMetadataCompat.METADATA_KEY_TITLE, track.title);
		metadata.putString(android.support.v4.media.MediaMetadataCompat.METADATA_KEY_ARTIST, track.artist);
		metadata.putString(android.support.v4.media.MediaMetadataCompat.METADATA_KEY_ALBUM, track.album);
		this.session.setMetadata(metadata.build());

		const state = new android.support.v4.media.session.PlaybackStateCompat.Builder();
		state.setActions(
			android.support.v4.media.session.PlaybackStateCompat.ACTION_PLAY
			| android.support.v4.media.session.PlaybackStateCompat.ACTION_PAUSE
			| android.support.v4.media.session.PlaybackStateCompat.ACTION_STOP
		);
		if (playing) {
			state.setState(
				android.support.v4.media.session.PlaybackStateCompat.STATE_PLAYING,
				android.support.v4.media.session.PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN,
				1,
			);
		} else {
			state.setState(
				android.support.v4.media.session.PlaybackStateCompat.STATE_PAUSED,
				android.support.v4.media.session.PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN,
				0,
			);
		}
		this.session.setPlaybackState(state.build());

		builder.setLargeIcon(track.art);
		notificationManager.notify(NOTIFICATION_ID, builder.build());
	}

	addActions(builder: androidx.core.app.NotificationCompat.Builder, playing: boolean): void {
		const playIntent = new android.content.Intent();
		playIntent.setClassName(this, PLAYBACK_RECEIVER_CLASSNAME);
		playIntent.putExtra("ACTION", "PLAY");
		const playPendingIntent = android.app.PendingIntent.getBroadcast(this, 1, playIntent, 0);

		const pauseIntent = new android.content.Intent();
		pauseIntent.setClassName(this, PLAYBACK_RECEIVER_CLASSNAME);
		pauseIntent.putExtra("ACTION", "PAUSE");
		const pausePendingIntent = android.app.PendingIntent.getBroadcast(this, 2, pauseIntent, 0);

		const prevIntent = new android.content.Intent();
		prevIntent.setClassName(this, PLAYBACK_RECEIVER_CLASSNAME);
		prevIntent.putExtra("ACTION", "PREV");
		const prevPendingIntent = android.app.PendingIntent.getBroadcast(this, 3, prevIntent, 0);

		const nextIntent = new android.content.Intent();
		nextIntent.setClassName(this, PLAYBACK_RECEIVER_CLASSNAME);
		nextIntent.putExtra("ACTION", "NEXT");
		const nextPendingIntent = android.app.PendingIntent.getBroadcast(this, 4, nextIntent, 0);

		builder.addAction(android.R.drawable.ic_media_previous, "Previous", prevPendingIntent);
		if (!playing) {
			builder.addAction(android.R.drawable.ic_media_play, "Play", playPendingIntent);
		} else {
			builder.addAction(android.R.drawable.ic_media_pause, "Pause", pausePendingIntent);
		}
		builder.addAction(android.R.drawable.ic_media_next, "Next", nextPendingIntent);
	}
}


@JavaProxy("tk.ozymandias.ginger.RestartReceiver")
export class RestartReceiver extends android.content.BroadcastReceiver {
	onReceive(context: android.content.Context, intent: android.content.Intent): void {
		const serviceIntent = new android.content.Intent();
		serviceIntent.setClassName(context, PLATFORM_SERVICE_CLASSNAME);
		context.startService(serviceIntent);
	}
}


@JavaProxy("tk.ozymandias.ginger.PlaybackReceiver")
export class PlaybackReceiver extends android.content.BroadcastReceiver {
	onReceive(context: android.content.Context, intent: android.content.Intent): void {
		const address = ApplicationSettings.getString(CURRENT_CONNECTION_ADDRESS, null);
		const password = ApplicationSettings.getString(CURRENT_CONNECTION_PASSWORD, null);
		const mopidy = ApplicationSettings.getBoolean(CURRENT_MOPIDY);
		const action = intent.getStringExtra("ACTION");
		const act = (socket) => {
			switch (action) {
				case "PLAY":
					socket.playback.play();
					break;
				case "PAUSE":
					socket.playback.pause();
					break;
				case "NEXT":
					socket.playback.next();
					break;
				case "PREV":
					socket.playback.previous();
			}
		};
		if (mopidy) {
			const socket = new Mopidy({ webSocketUrl: address });
			act(socket);
		} else {
			const socket = new MPC();
			socket.connectWebSocket(address);
			if (password) {
				socket.connection.password(password);
			}
			act(socket);
		}
	}
}


@Injectable({
	providedIn: "root"
})
export class PlatformService {

	constructor(protected mpc: MpcService) {
		this.mpc.connection.subscribe((conn) => {
			if (conn) {
				const context = Application.android.context;
				const intent = new android.content.Intent();
				intent.setClassName(context, PLATFORM_SERVICE_CLASSNAME);
				context.startService(intent);
			}
		});
	}
}
