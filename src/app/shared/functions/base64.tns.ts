import { isIOS } from "tns-core-modules/platform";

declare var NSString: any;
declare var NSUTF8StringEncoding: any;
declare var java: any;
declare var android: any;

export function base64Encode(value) {
	if (isIOS) {
		const text = NSString.stringWithString(value);
		const data = text.dataUsingEncoding(NSUTF8StringEncoding);
		return data.base64EncodedStringWithOptions(0);
	} else {  // tslint:disable-line:unnecessary-else
		const text = new java.lang.String(value);
		const data = text.getBytes("UTF-8");
		return android.util.Base64.encodeToString(data, android.util.Base64.NO_WRAP);
	}
}
