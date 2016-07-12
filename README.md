# Currently WIP

# Import data from a Citibank credit card statment into Google Sheets

## Purpose
Citibank credit card statements come as PDFs, which is not a great format for data. This application extracts the statement data from the PDF and loads it into a Google Sheet.

## How it works
It runs entirely in your browser, no data is sent over the internet. Choose the PDF statement and the destination Google Sheet and your browser will load the data into a new sheet.

## To use
Visit http://matthewrwilton.github.io/citibank-statement-to-sheets/

## Limitations
The application uses modern browser functionality and will not work in older out of date browsers. Use Chrome.

## Development
Clone the repository. Checkout the master branch.

Running "npm run-script build" or "webpack" will build the application using webpack. To build on changes run "npm run-script watch".

Tests can be run with "npm test". For a continuous test runner use "npm run-script test-debug".
