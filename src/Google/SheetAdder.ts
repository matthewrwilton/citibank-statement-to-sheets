import SheetAddResult from "./SheetAddResult";
import SheetsApiLoader from "./SheetsApiLoader";

export default class SheetAdder {
    public add(spreadsheetId: string): Promise<SheetAddResult> {
        return SheetsApiLoader.load()
            .then(() => {
                return this.addSheet(spreadsheetId);
            }, (reason) => { return SheetAddResult.ApiLoadFailure(reason); });
    }

    private addSheet(spreadsheetId: string): Promise<SheetAddResult> {
        return gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: spreadsheetId,
                requests: [
                    {
                        addSheet: {
                            properties: {
                                index: 0
                            }
                        }
                    }
                ]
            }).then((response) => {
                return SheetAddResult.Success();
            }, (reason) => { 
                return SheetAddResult.AddSheetFailure(reason); 
            });
    }
}