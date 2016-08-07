export default class SpreadsheetWriteResult {
    constructor(
        public successful: boolean,
        public errorMessage: string) { }

    static ApiLoadFailure(reason: string): SpreadsheetWriteResult {
        return new SpreadsheetWriteResult(false, `Failed to load Google Sheets API. Reason: ${reason}`);
    }

    static WriteFailure(reason: string): SpreadsheetWriteResult {
        return new SpreadsheetWriteResult(false, `Failed to write to the Google Sheet. Reason: ${reason}`);
    }

    static Success(): SpreadsheetWriteResult {
        return new SpreadsheetWriteResult(true, "");
    }
}