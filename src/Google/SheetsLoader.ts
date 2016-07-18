import Sheet from "./Sheet";
import SheetsLoadResult from "./SheetsLoadResult";

const sheetMimeType = "application/vnd.google-apps.spreadsheet"; 

export default class SheetsLoader {
    public load(): Promise<SheetsLoadResult> {
        return this.loadDriveApi()
            .then(this.requestSheets, (reason) => { return SheetsLoadResult.ApiLoadFailure(reason); });
    }

    private loadDriveApi(): Promise<void> {
        return gapi.client.load('drive', 'v3');
    }

    private requestSheets(): Promise<SheetsLoadResult> {
        return gapi.client.drive.files.list({
                pageSize: 10,
                q: `mimeType='${sheetMimeType}'`
            }).then((response) => {
                let sheets = response.result.files;
                return SheetsLoadResult.Success(sheets.map((sheet) => { return new Sheet(sheet.id, sheet.name) }));
            }, (reason) => { 
                return SheetsLoadResult.ApiListFailure(reason); 
            });
    }
}