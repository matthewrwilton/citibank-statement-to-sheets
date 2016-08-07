export default class SheetsAddResult {
    constructor(
        public successful: boolean,
        public errorMessage: string) { }

    static ApiLoadFailure(reason: string): SheetsAddResult {
        return new SheetsAddResult(false, `Failed to load Google Sheets API. Reason: ${reason}`);
    }

    static AddSheetFailure(reason: string): SheetsAddResult {
        return new SheetsAddResult(false, `Failed to add a new sheet. Reason: ${reason}`);
    }

    static Success(): SheetsAddResult {
        return new SheetsAddResult(true, "");
    }
}