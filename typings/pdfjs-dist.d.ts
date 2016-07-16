// Declare pdfjs-dist module so that webpack can find it.
// Can't use typings to import the pdfjs defintions named "pdfjs-dist"
// because pdfjs is a global module.

declare var PDFJS: PDFJSStatic;
 
declare module "pdfjs-dist" {
     export = PDFJS;
}
