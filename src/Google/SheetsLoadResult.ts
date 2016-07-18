import Sheet from "./Sheet";

export default class SheetsLoadResult {
    constructor(
        public successful: boolean,
        public sheets: Sheet[],
        public errorMessage: string) { }

    static ApiLoadFailure(reason: string): SheetsLoadResult {
        return new SheetsLoadResult(false, [], `Failed to load Google Drive API. Reason: ${reason}`);
    }

    static ApiListFailure(reason: string): SheetsLoadResult {
        return new SheetsLoadResult(false, [], `Failed to retrieve a list of sheets from Google Drive API. Reason: ${reason}`);
    }

    static Success(sheets: Sheet[]): SheetsLoadResult {
        return new SheetsLoadResult(true, sheets, "");
    }
}