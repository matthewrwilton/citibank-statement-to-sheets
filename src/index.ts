import * as $ from "jquery";
import PdfScraper from "./PdfScraping/PdfScraper";
import StatementParser from "./Statements/Parsing/StatementParser";

const retryButtonSelector = "#retry-button";
const filePickerSelector = "#statement-file-picker";
const filePickerLabelSelector = "#file-picker-label";
const passwordSectionSelector = "#password-section";
const passwordInputLabelSelector = "#password-input-label";
const passwordInputSelector = "#password-input";

$(filePickerSelector).on("change", convertPdf);
$(retryButtonSelector).click(convertPdf);

function convertPdf() {
    let filePicker = <HTMLInputElement>$(filePickerSelector).get(0),
        password = (<HTMLInputElement>$(passwordInputSelector).get(0)).value,
        pdfScraper = new PdfScraper();

    if (filePicker.files.length == 0) {
        clearAndHidePasswordInput();
        return;
    }

    let pdfFile = filePicker.files[0];
    pdfScraper.scrapeText(window.URL.createObjectURL(pdfFile), password).then(result => {
        if (result.successful) {
            let statementParser = new StatementParser(),
                statementItems = statementParser.parse(result.text);

            // TODO: upload statement items into Google Sheets

            clearAndHidePasswordInput();
        }
        else if (result.passwordRequired) {
            showPasswordRequiredError();
        }
        else if (result.passwordIncorrect) {
            showIncorrectPasswordError();
        }
    });
}

function clearAndHidePasswordInput() {
    $(passwordSectionSelector).hide();
    (<HTMLInputElement>$(passwordInputSelector).get(0)).value = "";
}

function showPasswordRequiredError() {
    $(passwordInputLabelSelector).text("Statement password required");
    $(filePickerLabelSelector).text("CHANGE STATEMENT");
    $(passwordSectionSelector).show();
}

function showIncorrectPasswordError() {
    $(passwordInputLabelSelector).text("Incorrect password");
    (<HTMLInputElement>$(passwordInputSelector).get(0)).value = "";
    $(filePickerLabelSelector).text("CHANGE STATEMENT");
    $(passwordSectionSelector).show();
}