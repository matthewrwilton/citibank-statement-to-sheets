import Spreadsheet from "./Spreadsheet";
import SpreadsheetsLoadResult from "./SpreadsheetsLoadResult";

const sheetMimeType = "application/vnd.google-apps.spreadsheet"; 

export default class SpreadsheetsLoader {
    public load(): Promise<SpreadsheetsLoadResult> {
        return this.loadDriveApi()
            .then(this.requestSheets, (reason) => { return SpreadsheetsLoadResult.ApiLoadFailure(reason); });
    }

    private loadDriveApi(): Promise<void> {
        return gapi.client.load('drive', 'v3');
    }

    private requestSheets(): Promise<SpreadsheetsLoadResult> {
        return gapi.client.drive.files.list({
                pageSize: 10,
                q: `mimeType='${sheetMimeType}'`
            }).then((response) => {
                let sheets = response.result.files;
                return SpreadsheetsLoadResult.Success(sheets.map((spreadsheet) => { 
                    return new Spreadsheet(spreadsheet.id, spreadsheet.name) 
                }));
            }, (reason) => { 
                return SpreadsheetsLoadResult.ApiListFailure(reason); 
            });
    }
}