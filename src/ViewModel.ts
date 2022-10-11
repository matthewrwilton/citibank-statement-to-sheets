import * as ko from "knockout";
import PdfScraper from "./PdfScraping/PdfScraper";
import StatementItem from "./Statements/StatementItem";
import StatementParser from "./Statements/Parsing/StatementParser";

export default class ViewModel {
    public authorisationFailed = ko.observable(false);
    public error = ko.observable("");
    public importing = ko.observable(false);
    public passwordIncorrect = ko.observable(false);
    public passwordRequired = ko.observable(false);
    public statement: KnockoutObservable<File> = ko.observable(null);
    public statementImported = ko.observable(false);
    public statementPassword = ko.observable("");

    public canImport = ko.pureComputed(() => {
        return (!this.passwordRequired() || this.statementPassword() !== "");
    });

    public errored = ko.pureComputed(() => {
        const error = this.error();
        return error !== null && error !== ""; 
    });

    public statementFileName = ko.pureComputed(() => {
        let statement = this.statement();
        return statement !== null ? statement.name : ""; 
    }); 

    public statementSelected = ko.pureComputed(() => {
        return this.statement() !== null; 
    });

    public importAnother() {
        this.statementImported(false);
    }

    public importStatement() {
        this.importing(true);

        this.scrapePdf()
            .then((statementText) => {
                let statementParser = new StatementParser(),
                    statementItems = statementParser.parse(statementText);
                
                console.log(statementItems);
            })
            .then(() => { this.importing(false); });
    }

    public onStatementChange(data: ViewModel, event: Event) {
        let statementInput = <HTMLInputElement>event.target;

        this.statementPassword("");
        
        if (statementInput.files.length == 0) {
            this.statement(null);
            return;
        }
        
        this.statement(statementInput.files[0]);        
        
        this.scrapePdf()
            .catch(() => { /* Errors already handled */ });
    }

    public retry() {
        this.error("");
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

    private statementItemsToArray(items: StatementItem[]): any[][] {
        return [[
            "CARD NUMBER",
            "DATE",
            "DESCRIPTION",
            "REFERENCE #",
            "AMOUNT"
        ]].concat(items.map(item => {
            return [
                item.cardNumber,
                item.date,
                item.transactionDetails,
                item.referenceNumber,
                item.amount
            ];
        }))
    }
}

const viewModel = new ViewModel();
ko.applyBindings(viewModel);