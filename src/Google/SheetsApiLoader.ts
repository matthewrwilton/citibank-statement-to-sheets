const SHEETS_DISCOVERY_URL = "https://sheets.googleapis.com/$discovery/rest?version=v4";

export default class SheetsApiLoader {
    static load(): Promise<void> {
        if (gapi.client.sheets !== undefined) {
            return Promise.resolve(null);
        }

        return gapi.client.load(SHEETS_DISCOVERY_URL);
    }
}