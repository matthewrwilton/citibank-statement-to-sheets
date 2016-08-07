import Spreadsheet from "./Spreadsheet";

export default class SpreadsheetsLoadResult {
    constructor(
        public successful: boolean,
        public sheets: Spreadsheet[],
        public errorMessage: string) { }

    static ApiLoadFailure(reason: string): SpreadsheetsLoadResult {
        return new SpreadsheetsLoadResult(false, [], `Failed to load Google Drive API. Reason: ${reason}`);
    }

    static ApiListFailure(reason: string): SpreadsheetsLoadResult {
        return new SpreadsheetsLoadResult(false, [], `Failed to retrieve a list of sheets from Google Drive API. Reason: ${reason}`);
    }

    static Success(sheets: Spreadsheet[]): SpreadsheetsLoadResult {
        return new SpreadsheetsLoadResult(true, sheets, "");
    }
}