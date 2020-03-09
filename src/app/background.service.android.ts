export const SERVICE_CLASSNAME = "tk.ozymandias.ginger.Service";


@JavaProxy("tk.ozymandias.ginger.Service")
export class Service extends android.app.Service {
	private timerId: any;

	public onBind(): android.os.IBinder {
		return null;
	}

	public onCreate(): void {
		super.onCreate();
		console.log("SERVICE CREATED");

		if (!this.timerId) {
			this.timerId = setInterval(() => {
				console.log("PING");
			}, 1000);
		}
	}

	public onStartCommand(intent: android.content.Intent, flags: number, startId: number): number {
		console.log("SERVICE STARTED");
		return android.app.Service.START_REDELIVER_INTENT;
	}

	public onDestroy(): void {
		console.log("SERVICE DESTROYED");
		super.onDestroy();
		clearInterval(this.timerId);
	}
}
