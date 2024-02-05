# Import data from a Citibank credit card statment into Google Sheets

## Purpose
Citibank credit card statements come as PDFs, which is not a great format for data. This application extracts the statement data from the PDF and loads it into a Google Sheet.

## How it works
It runs entirely client-side in your browser, interacting with the Google Drive and Google Sheets APIs. Choose the PDF statement and the destination Google Sheet and your browser will load the data into a new sheet.

## To use
Visit https://matthewrwilton.github.io/citibank-statement-to-sheets/

## Limitations
The application uses modern browser functionality and will not work in older out of date browsers.

## Development
### General development
Clone the repository. Checkout the master branch.

Build the application using webpack by running `npm run-script build` or `webpack`. To have the application continuously build on changes run `npm run-script watch`.

Usage of the Google Drive and Sheets APIs require setting up an application in the [Google API Console](https://console.developers.google.com) to get an OAuth client ID. To register for OAuth an authorised JavaScript origin is needed, which requires hosting the application.

There are many ways of hosting the application locally. I already had IIS Express and used the following command to host the application locally `iisexpress /path:{PATH_TO_REPO}\www /port:8080` e.g. `iisexpress /path:C:\citibank-statement-to-sheets\www /port:8080`

Tests can be run with `npm test`. Use `npm run-script test-debug` to start a continuous test runner.

### Handling statement PDF changes
From time to time the format of the PDF statement changes and this causes the algorithm that parses the statement items from the PDF text to incorrectly parse them.

The easiest way to quickly handle these changes is to checkout the `for-debugging-pdf-parsing` branch, build the application (`npm run-script build`), and then open the built app in a browser and using developer tools add a breakpoint into `importStatement()` to examine the array of text extracted from the PDF.

Once the changes have been discovered tests in `StatementParserTests` can be added or adapted, and the algorithm in `StatementParser` updated.
