import { Injectable } from "@angular/core";
import { first } from "rxjs/operators";
import * as app from "tns-core-modules/application";
import * as platform from "tns-core-modules/platform";
import * as util from "tns-core-modules/utils/utils";
import * as settings from "tns-core-modules/application-settings";
import * as fs from "tns-core-modules/file-system";
import { ImageCacheIt } from "nativescript-image-cache-it";

import { MpdService } from "@src/app/shared/services/mpd.service";
import { MopidyService } from "@src/app/shared/services/mopidy.service";
import { MPClientService } from "@src/app/shared/services/mpclient.service";
import { ArtService } from "@src/app/shared/services/art.service";


export const PLATFORM_SERVICE_CLASSNAME = "tk.ozymandias.ginger.PlatformService";
export const RESTART_RECEIVER_CLASSNAME = "tk.ozymandias.ginger.RestartReceiver";
export const PLAYBACK_RECEIVER_CLASSNAME = "tk.ozymandias.ginger.PlaybackReceiver";


@JavaProxy("tk.ozymandias.ginger.PlatformService")
export class NativePlatformService extends android.app.Service {
	public mpc: MPClientService;
	public art: ArtService;
	private session: android.support.v4.media.session.MediaSessionCompat;
	private address: string;
	private password: string;
	private mopidy: boolean;

	public onBind(): android.os.IBinder {
		return null;
	}

	public onCreate(): void {
		super.onCreate();
		const mpd = new MpdService();
		const mopidy = new MopidyService();
		this.mpc = new MPClientService(mpd, mopidy);
		this.art = new ArtService();
		this.session = new android.support.v4.media.session.MediaSessionCompat(this, "PlaybackSession");

		const CHANNEL_ID = "persistence";
		const CHANNEL_NAME = "Background service indicator";
		const CHANNEL_DESC = "This is required to show notifications when the app isn't running.";
		const notificationManager = this.getSystemService(android.content.Context.NOTIFICATION_SERVICE);
		if (platform.device.sdkVersion >= "26") {
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
		const builder = new androidx.core.app.NotificationCompat.Builder(app.android.context, CHANNEL_ID);
		builder
			.setSmallIcon(util.ad.resources.getDrawableId("ginger_mono"))
			.setContentText("You can safely hide this notification")
			.setContentTitle("ginger is running")
			.setVisibility(androidx.core.app.NotificationCompat.VISIBILITY_SECRET);
		this.startForeground(8, builder.build());
	}

	public onStartCommand(intent: android.content.Intent, flags: number, startId: number): number {
		this.address = intent.getStringExtra("ADDRESS") || settings.getString("MPD_ADDRESS", null);
		this.password = intent.getStringExtra("PASSWORD") || settings.getString("MPD_PASSWORD", null);
		this.mopidy = intent.getBooleanExtra("MOPIDY", false) || settings.getBoolean("MOPIDY", false);

		if (this.address !== null) {
			this.mpc.connect(this.address, this.password, this.mopidy)
				// .pipe(timeout(750))
				.subscribe((success) => {
					if (success) {
						this.mpc.removeAllListeners();
						this.mpc.on("changed-player")
							.subscribe(() => {
							this.mpc.currentSong
								.pipe(first())
								.subscribe((song) => {
									this.sendMediaNotification(
										song.albumArtist || "",
										song.artist || "",
										song.album || "",
										song.title || song.name || "",
									);
								});
						});
						this.session.setActive(true);
					}
				});
		}
		return android.app.Service.START_REDELIVER_INTENT;
	}

	public onDestroy(): void {
		super.onDestroy();
		if (this.session) {
			this.session.setActive(false);
			this.session.release();
		}
		const restartIntent = new android.content.Intent();
		restartIntent.setClassName(this, RESTART_RECEIVER_CLASSNAME);
		this.sendBroadcast(restartIntent);
	}

	public onTaskRemoved(intent: android.content.Intent): void {
		this.stopSelf();
	}

	private sendMediaNotification(albumArtist: string, artist: string, album: string, title: string): void {
		const NOTIFICATION_ID = 12;
		const CHANNEL_ID = "playback";
		const CHANNEL_NAME = "Playback Notifications";
		const CHANNEL_DESC = "Now Playing Notifications";
		const notificationManager = this.getSystemService(android.content.Context.NOTIFICATION_SERVICE);

		if (platform.device.sdkVersion >= "26") {
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

		this.mpc.status
			.pipe(first())
			.subscribe({
				next: (status) => {
					builder
						.setContentTitle(title)
						.setContentText(artist)
						.setSmallIcon(util.ad.resources.getDrawableId("mdi_play_pause"))
						.setContentIntent(pendingIntent)
						.setVisibility(androidx.core.app.NotificationCompat.VISIBILITY_PUBLIC)
						.setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
							.setMediaSession(this.session.getSessionToken())
							.setShowActionsInCompactView([0, 1, 2])
						);
					this.addActions(builder, status.state === "play");

					this.getArt(albumArtist || artist, album)
						.then((art) => {
							const metadata = new android.support.v4.media.MediaMetadataCompat.Builder();
							metadata.putBitmap(android.support.v4.media.MediaMetadataCompat.METADATA_KEY_ALBUM_ART, art);
							metadata.putString(android.support.v4.media.MediaMetadataCompat.METADATA_KEY_ALBUM_ARTIST, albumArtist);
							metadata.putString(android.support.v4.media.MediaMetadataCompat.METADATA_KEY_ARTIST, artist);
							metadata.putString(android.support.v4.media.MediaMetadataCompat.METADATA_KEY_ALBUM, album);
							metadata.putString(android.support.v4.media.MediaMetadataCompat.METADATA_KEY_TITLE, title);
							this.session.setMetadata(metadata.build());

							const playbackState = new android.support.v4.media.session.PlaybackStateCompat.Builder();
							playbackState.setActions(
								android.support.v4.media.session.PlaybackStateCompat.ACTION_PLAY
								| android.support.v4.media.session.PlaybackStateCompat.ACTION_PAUSE
								| android.support.v4.media.session.PlaybackStateCompat.ACTION_STOP
							);
							switch (status.state) {
								case "play":
									playbackState.setState(
										android.support.v4.media.session.PlaybackStateCompat.STATE_PLAYING,
										android.support.v4.media.session.PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN,
										1,
									);
									break;
								case "pause":
									playbackState.setState(
										android.support.v4.media.session.PlaybackStateCompat.STATE_PAUSED,
										android.support.v4.media.session.PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN,
										0,
									);
									break;
								case "stop":
									playbackState.setState(
										android.support.v4.media.session.PlaybackStateCompat.STATE_STOPPED,
										android.support.v4.media.session.PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN,
										0,
									);
							}
							this.session.setPlaybackState(playbackState.build());

							builder.setLargeIcon(art);
							notificationManager.notify(NOTIFICATION_ID, builder.build());
						});
				},
			});
	}

	private async getArt(artist: string, album: string): Promise<android.graphics.Bitmap> {
		return new Promise((resolve) => {
			this.art.getArt(artist, album, true)
				.pipe(first())
				.subscribe((urls) => {
					Promise.all([
						ImageCacheIt.getItem(urls[0]),
						ImageCacheIt.getItem(urls[1]),
					])
					.then(([spotify, lastfm]) => {
						if (!spotify && !lastfm) {
							const bitmap = android.graphics.Bitmap.createBitmap(720, 720, android.graphics.Bitmap.Config.ARGB_8888);
							const canvas = new android.graphics.Canvas(bitmap);
							const paint = new android.graphics.Paint();
							const typeface = android.graphics.Typeface.createFromFile(
								fs.path.join(fs.knownFolders.currentApp().path, "fonts/materialdesignicons-webfont.ttf"));
							canvas.drawColor(android.graphics.Color.parseColor("#212121"));
							paint.setAntiAlias(true);
							paint.setSubpixelText(true);
							paint.setTypeface(typeface);
							paint.setStyle(android.graphics.Paint.Style.FILL);
							paint.setColor(android.graphics.Color.WHITE);
							paint.setTextSize(700);
							canvas.drawText("\uF025;", 10, 620, paint);
							resolve(bitmap);
						} else if (spotify) {
							resolve(android.graphics.BitmapFactory.decodeFile(spotify));
						} else {
							resolve(android.graphics.BitmapFactory.decodeFile(lastfm));
						}
					});
				});
		});
	}

	private addActions(builder: androidx.core.app.NotificationCompat.Builder, playing: boolean): void {
		const playIntent = new android.content.Intent();
		playIntent.setClassName(this, PLAYBACK_RECEIVER_CLASSNAME);
		playIntent.putExtra("ACTION", "PLAY");
		playIntent.putExtra("ADDRESS", this.address);
		playIntent.putExtra("PASSWORD", this.password);
		playIntent.putExtra("MOPIDY", this.mopidy);
		const playPendingIntent = android.app.PendingIntent.getBroadcast(this, 1, playIntent, 0);

		const pauseIntent = new android.content.Intent();
		pauseIntent.setClassName(this, PLAYBACK_RECEIVER_CLASSNAME);
		pauseIntent.putExtra("ACTION", "PAUSE");
		pauseIntent.putExtra("ADDRESS", this.address);
		pauseIntent.putExtra("PASSWORD", this.password);
		pauseIntent.putExtra("MOPIDY", this.mopidy);
		const pausePendingIntent = android.app.PendingIntent.getBroadcast(this, 2, pauseIntent, 0);

		const prevIntent = new android.content.Intent();
		prevIntent.setClassName(this, PLAYBACK_RECEIVER_CLASSNAME);
		prevIntent.putExtra("ACTION", "BACK");
		prevIntent.putExtra("ADDRESS", this.address);
		prevIntent.putExtra("PASSWORD", this.password);
		prevIntent.putExtra("MOPIDY", this.mopidy);
		const prevPendingIntent = android.app.PendingIntent.getBroadcast(this, 3, prevIntent, 0);

		const nextIntent = new android.content.Intent();
		nextIntent.setClassName(this, PLAYBACK_RECEIVER_CLASSNAME);
		nextIntent.putExtra("ACTION", "NEXT");
		nextIntent.putExtra("ADDRESS", this.address);
		nextIntent.putExtra("PASSWORD", this.password);
		nextIntent.putExtra("MOPIDY", this.mopidy);
		const nextPendingIntent = android.app.PendingIntent.getBroadcast(this, 4, nextIntent, 0);

		// For some reason custom icons appear blank, using default as placeholders
		// builder.addAction(util.ad.resources.getDrawableId("mdi_skip_previous"), "Previous", prevPendingIntent);
		builder.addAction(android.R.drawable.ic_media_previous, "Previous", prevPendingIntent);
		if (!playing) {
			// builder.addAction(util.ad.resources.getDrawableId("mdi_play"), "Play", playPendingIntent);
			builder.addAction(android.R.drawable.ic_media_play, "Play", playPendingIntent);
		} else {
			// builder.addAction(util.ad.resources.getDrawableId("mdi_pause"), "Pause", pausePendingIntent);
			builder.addAction(android.R.drawable.ic_media_pause, "Pause", pausePendingIntent);
		}
		// builder.addAction(util.ad.resources.getDrawableId("mdi_skip_next"), "Next", nextPendingIntent);
		builder.addAction(android.R.drawable.ic_media_next, "Next", nextPendingIntent);
	}
}


@JavaProxy("tk.ozymandias.ginger.RestartReceiver")
export class RestartReceiver extends android.content.BroadcastReceiver {
	public onReceive(context: android.content.Context, intent: android.content.Intent): void {
		const serviceIntent = new android.content.Intent();
		serviceIntent.setClassName(context, PLATFORM_SERVICE_CLASSNAME);
		context.startService(serviceIntent);
	}
}


@JavaProxy("tk.ozymandias.ginger.PlaybackReceiver")
export class PlaybackReceiver extends android.content.BroadcastReceiver {
	public onReceive(context: android.content.Context, intent: android.content.Intent): void {
		const mpd = new MpdService();
		const mopidy = new MopidyService();
		const mpc = new MPClientService(mpd, mopidy);
		const address = intent.getStringExtra("ADDRESS");
		const password = intent.getStringExtra("PASSWORD");
		const isMopidy = intent.getBooleanExtra("MOPIDY", false);
		const action = intent.getStringExtra("ACTION");
		mpc.connect(address, password, isMopidy)
			.subscribe((success) => {
				if (success) {
					switch (action) {
						case "PLAY":
							mpc.playback.play();
							break;
						case "PAUSE":
							mpc.playback.pause();
							break;
						case "NEXT":
							mpc.playback.next();
							break;
						case "BACK":
							mpc.playback.previous();
					}
				}
			});
	}
}


@Injectable({
	providedIn: "root",
})
export class PlatformService {
	constructor() {}

	public setCredentials(address: string, password: string, mopidy: boolean) {
		if (address !== null) {
			const context = app.android.context;
			const intent = new android.content.Intent();
			intent.setClassName(context, PLATFORM_SERVICE_CLASSNAME);
			intent.putExtra("ADDRESS", address);
			intent.putExtra("PASSWORD", password || "");
			intent.putExtra("MOPIDY", mopidy);
			context.startService(intent);
		}
	}
}
