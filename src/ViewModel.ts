import * as ko from "knockout";
import AuthorisationResult from "./Google/AuthorisationResult";
import Authoriser from "./Google/Authoriser";
import PdfScraper from "./PdfScraping/PdfScraper";
import SheetAdder from "./Google/SheetAdder";
import Spreadsheet from "./Google/Spreadsheet";
import SpreadsheetsLoader from "./Google/SpreadsheetsLoader";
import SpreadsheetsLoadResult from "./Google/SpreadsheetsLoadResult";
import StatementParser from "./Statements/Parsing/StatementParser";

export default class ViewModel {
    public authorising = ko.observable(true);
    public authorisationFailed = ko.observable(false);
    public loadingSheets = ko.observable(false);
    public loadingSheetsFailed = ko.observable(false);
    public passwordIncorrect = ko.observable(false);
    public passwordRequired = ko.observable(false);
    public selectedSheet: ko.Observable<Spreadsheet> = ko.observable(null);
    public sheets: ko.ObservableArray<Spreadsheet> = ko.observableArray([]);
    public sheetsLoaded = ko.observable(false);
    public statement: ko.Observable<File> = ko.observable(null);
    public statementImported = ko.observable(false);
    public statementPassword = ko.observable("");

    public canImport = ko.pureComputed(() => {
        let selectedSheet = this.selectedSheet();
        return this.statementSelected() && selectedSheet !== null && selectedSheet !== undefined && 
            (!this.passwordRequired() || this.statementPassword() !== "");
    });

    public statementFileName = ko.pureComputed(() => {
        let statement = this.statement();
        return statement !== null ? statement.name : ""; 
    }); 

    public statementSelected = ko.pureComputed(() => {
        return this.statement() !== null; 
    }); 


    public authorise() {
        this.authorisationFailed(false);
        this.authorising(true);
        
        let gapiAuthoriser = new Authoriser(this.handleGapiAuthorisation, this);
        gapiAuthoriser.authorise();
    }

    public importStatement() {
        this.scrapePdf()
            .then((statementText) => {
                let sheetId = this.selectedSheet().id, 
                    statementParser = new StatementParser(),
                    statementItems = statementParser.parse(statementText),
                    sheetAdder = new SheetAdder();

                // TODO: upload statement items into Google Sheets
                sheetAdder.add(sheetId);

                this.statementImported(true);
                this.statement(null);
            }, (reason) => { /* Errors already handled. Do not continue with import. */ });
    }

    public onStatementChange(data: ViewModel, event: Event) {
        let statementInput = <HTMLInputElement>event.target;

        this.statementImported(false);
        this.statementPassword("");
        
        if (statementInput.files.length == 0) {
            this.statement(null);
            return;
        }
        
        this.statement(statementInput.files[0]);        
        
        this.scrapePdf()
            .catch(() => { /* Errors already handled */ });
    }

    private handleGapiAuthorisation(result: AuthorisationResult) {
        if (result.authorised) {
            this.loadGoogleSheets();
        }
        else {
            console.error(`gapi authorisation error: ${result.errorMessage}`);
            this.authorisationFailed(true);
        }
        this.authorising(false);
    }

    private loadGoogleSheets() {
        let sheetsLoader = new SpreadsheetsLoader();
        
        this.loadingSheets(true);
        sheetsLoader.load()
            .then((result: SpreadsheetsLoadResult) => {
                if (result.successful) {
                    ko.utils.arrayPushAll(this.sheets, result.sheets);
                    this.sheetsLoaded(true);
                }
                else {
                    console.error(result.errorMessage);
                    this.loadingSheetsFailed(true);
                }
                this.loadingSheets(false);
            });
    }

    private scrapePdf(): Promise<string[]> {
        let statementObjectUrl = window.URL.createObjectURL(this.statement()),
            pdfScraper = new PdfScraper();

        return pdfScraper.scrapeText(statementObjectUrl, this.statementPassword())
            .then(result => {
                this.passwordRequired(false);
                this.passwordIncorrect(false);

                if (result.successful) {
                    return result.text;
                }
                else if (result.passwordRequired) {
                    this.passwordRequired(true);
                    return Promise.reject<string[]>("Password required.");
                }
                else if (result.passwordIncorrect) {
                    this.passwordIncorrect(true);
                    return Promise.reject<string[]>("Password incorrect.");
                }
            });
    }
}

const viewModel = new ViewModel();
ko.applyBindings(viewModel);

// Make authorise available on the window so it can be called once the gapi script has loaded
// e.g. src="https://apis.google.com/js/client.js?onload=onGapiLoad"
(<any>window).onGapiLoad = viewModel.authorise.bind(viewModel);