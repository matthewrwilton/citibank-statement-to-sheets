import SheetAddResult from "./SheetAddResult";

export default class SheetAdder {
    public add(spreadsheetId: string): Promise<SheetAddResult> {
        return this.loadSheetsApi()
            .then(() => {
                return this.addSheet(spreadsheetId);
            }, (reason) => { return SheetAddResult.ApiLoadFailure(reason); });
    }

    private loadSheetsApi(): Promise<void> {
        if (gapi.client.sheets !== undefined) {
            return Promise.resolve(null);
        }

        return gapi.client.load("https://sheets.googleapis.com/$discovery/rest?version=v4");
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