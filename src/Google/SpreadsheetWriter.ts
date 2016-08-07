import SheetsApiLoader from "./SheetsApiLoader";
import SpreadsheetWriteResult from "./SpreadsheetWriteResult";

export default class SpreadsheetWriter {
    public write(spreadsheetId: string, values:any[][]): Promise<SpreadsheetWriteResult> {
        return SheetsApiLoader.load()
            .then(() => {
                return this.addSheet(spreadsheetId, values);
            }, reason => { 
                return SpreadsheetWriteResult.ApiLoadFailure(reason); 
            });
    }

    private addSheet(spreadsheetId: string, values:any[][]): Promise<SpreadsheetWriteResult> {
        return gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: "A1",
                valueInputOption: "USER_ENTERED",
                values: values
            }).then((response) => {
                return SpreadsheetWriteResult.Success();
            }, reason => { 
                return SpreadsheetWriteResult.WriteFailure(reason); 
            });
    }
}
