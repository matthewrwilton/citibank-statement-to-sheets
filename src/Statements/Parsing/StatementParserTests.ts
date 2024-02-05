import StatementParser from "./StatementParser";
import StatementItem from "./../StatementItem";

describe("StatementParser", () => {
	describe("parse", () => {
		it("returns an empty array when input is not a statement", () => {
			let input = [
				"This is not a statement."
			];
			let target = new StatementParser();

			let expected = [];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});

		it("parses a single statement item statement", () => {
			let input = transactionsHeader
				.concat([
					"Card Number 0000 0000 0000 0000",
					"May 01",
					"ABCDEFG",
					"12.34",
					"11111111111111111111111"
				])
				.concat(statementEnding);
			let target = new StatementParser();

			let expected = [
				new StatementItem("0000 0000 0000 0000", "May 01", "ABCDEFG", "11111111111111111111111", "12.34", "")
			];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});

		it("parses last statement item correctly", () => {
			let input = transactionsHeader
				.concat([
					"Card Number 0000 0000 0000 0000",
					"May 01",
					"ABCDEFG",
					"12.34",
					"11111111111111111111111"
				])
				.concat(statementEnding)
				.concat([
					"A",
					"B",
					"C",
					"D"
				]);
			let target = new StatementParser();

			let expected = [
				new StatementItem("0000 0000 0000 0000", "May 01", "ABCDEFG", "11111111111111111111111", "12.34", "")
			];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});

		it("parses a multiple item statement", () => {
			let input = transactionsHeader
				.concat([
					"Card Number 0000 0000 0000 0000",
					"May 01",
					"ABCDEFG",
					"12.34",
					"11111111111111111111111",
					"May 02",
					"HIJKLMN",
					"56.78",
					"11111111111111111111112"
				])
				.concat(statementEnding);
			let target = new StatementParser();

			let expected = [
				new StatementItem("0000 0000 0000 0000", "May 01", "ABCDEFG", "11111111111111111111111", "12.34", ""),
				new StatementItem("0000 0000 0000 0000", "May 02", "HIJKLMN", "11111111111111111111112", "56.78", "")
			];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});

		it("parses items from multiple cards", () => {
			let input = transactionsHeader
				.concat([
					"Card Number 0000 0000 0000 0000",
					"May 01",
					"ABCDEFG",
					"12.34",
					"11111111111111111111111",
					"Card Number 1111 1111 1111 1111",
					"May 02",
					"HIJKLMN",
					"56.78",
					"11111111111111111111112"
				])
				.concat(statementEnding);
			let target = new StatementParser();

			let expected = [
				new StatementItem("0000 0000 0000 0000", "May 01", "ABCDEFG", "11111111111111111111111", "12.34", ""),
				new StatementItem("1111 1111 1111 1111", "May 02", "HIJKLMN", "11111111111111111111112", "56.78", "")
			];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});

		it("parses items across separate pages", () => {
			let input = transactionsHeader
				.concat([
					"Card Number 0000 0000 0000 0000",
					"May 01",
					"ABCDEFG",
					"12.34",
					"11111111111111111111111"
				])
				.concat(pageEnding)
				.concat(transactionsContinuedHeader)
				.concat([
					"May 02",
					"HIJKLMN",
					"56.78",
					"11111111111111111111112"
				])
				.concat(statementEnding);
			let target = new StatementParser();

			let expected = [
				new StatementItem("0000 0000 0000 0000", "May 01", "ABCDEFG", "11111111111111111111111", "12.34", ""),
				new StatementItem("0000 0000 0000 0000", "May 02", "HIJKLMN", "11111111111111111111112", "56.78", "")
			];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});

		it("parses a multi page, multi card statement", () => {
			let input = transactionsHeader
				.concat([
					"Card Number 0000 0000 0000 0000",
					"May 01",
					"ABCDEFG",
					"12.34",
					"11111111111111111111111",
					"Card Number 1111 1111 1111 1111",
					"May 02",
					"HIJKLMN",
					"56.78",
					"11111111111111111111112"
				])
				.concat(pageEnding)
				.concat(transactionsContinuedHeader)
				.concat([
					"May 03",
					"OPQ",
					"99.00",
					"11111111111111111111113",
					"Card Number 2222 2222 2222 2222",
					"May 04",
					"RSTUV",
					"10000.00",
					"11111111111111111111114"
				])
				.concat(statementEnding);
			let target = new StatementParser();

			let expected = [
				new StatementItem("0000 0000 0000 0000", "May 01", "ABCDEFG", "11111111111111111111111", "12.34", ""),
				new StatementItem("1111 1111 1111 1111", "May 02", "HIJKLMN", "11111111111111111111112", "56.78", ""),
				new StatementItem("1111 1111 1111 1111", "May 03", "OPQ", "11111111111111111111113", "99.00", ""),
				new StatementItem("2222 2222 2222 2222", "May 04", "RSTUV", "11111111111111111111114", "10000.00", "")
			];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});

		it ("parses a foreign currency transaction", () => {

			let input = transactionsHeader
				.concat([
					"Card Number 0000 0000 0000 0000",
					"Jun 15",
					"Foreign transaction",
					"100.00",
					"11111111111111111111111",
					"Foreign Amount 123456.00",
					"Jun 16",
					"ABCDEFG",
					"12.34",
					"11111111111111111111111"
				])
				.concat(statementEnding);
			let target = new StatementParser();

			let expected = [
				new StatementItem("0000 0000 0000 0000", "Jun 15", "Foreign transaction", "11111111111111111111111", "100.00", "Foreign Amount 123456.00"),
				new StatementItem("0000 0000 0000 0000", "Jun 16", "ABCDEFG", "11111111111111111111111", "12.34", "")
			];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});

		it ("ignores international transaction fee for foreign transactions", () => {

			let input = transactionsHeader
				.concat([
					"Card Number 0000 0000 0000 0000",
					"Jun 15",
					"Foreign transaction",
					"100.00",
					"11111111111111111111111",
					"Foreign Amount 123456.00",
					"AUD 123456.00 includes International Transaction fee AUD 10.00",
					"Jun 16",
					"ABCDEFG",
					"12.34",
					"11111111111111111111111"
				])
				.concat(statementEnding);
			let target = new StatementParser();

			let expected = [
				new StatementItem("0000 0000 0000 0000", "Jun 15", "Foreign transaction", "11111111111111111111111", "100.00", "Foreign Amount 123456.00"),
				new StatementItem("0000 0000 0000 0000", "Jun 16", "ABCDEFG", "11111111111111111111111", "12.34", "")
			];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});

		it("parses a card change straight after an international transaction", () => {
			let input = transactionsHeader
				.concat([
					"Card Number 0000 0000 0000 0000",
					"May 01",
					"ABCDEFG",
					"135.21",
					"11111111111111111111111",
					"Foreign Amount U.S. Dollar 99.00",
					"AUD 135.21 includes International Transaction fee AUD 4.45",
					"Card Number 1111 1111 1111 1111",
					"May 02",
					"HIJKLMN",
					"16.00",
					"11111111111111111111112",
				])
				.concat(statementEnding);
			let target = new StatementParser();

			let expected = [
				new StatementItem("0000 0000 0000 0000", "May 01", "ABCDEFG", "11111111111111111111111", "135.21", "Foreign Amount U.S. Dollar 99.00"),
				new StatementItem("1111 1111 1111 1111", "May 02", "HIJKLMN", "11111111111111111111112", "16.00", ""),
			];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});

		it ("parses a multi page statement, where there is a full page of transactions", () => {
			// Statements can have a page of entirely transactions. 
			// These pages don't end the transactions with the "(Continued next page)" text.
			let input = transactionsHeader
				.concat([
					"Card Number 0000 0000 0000 0000",
					"Aug 01",
					"ABCDEFG",
					"135.21",
					"11111111111111111111111"
				])
				.concat(alternatePageEnding)
				.concat(transactionsContinuedHeader)
				.concat([
					"Aug 02",
					"HIJKLMN",
					"16.00",
					"11111111111111111111112"
				])
				.concat(statementEnding);

			let target = new StatementParser();

			let expected = [
				new StatementItem("0000 0000 0000 0000", "Aug 01", "ABCDEFG", "11111111111111111111111", "135.21", ""),
				new StatementItem("0000 0000 0000 0000", "Aug 02", "HIJKLMN", "11111111111111111111112", "16.00", ""),
			];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});

		it("parses statement with new ending footer", () => {
			let input = transactionsHeader
				.concat([
					"Card Number 0000 0000 0000 0000",
					"May 01",
					"ABCDEFG",
					"12.34",
					"11111111111111111111111"
				])
				.concat("Total Citi Card Transactions ");
			let target = new StatementParser();

			let expected = [
				new StatementItem("0000 0000 0000 0000", "May 01", "ABCDEFG", "11111111111111111111111", "12.34", "")
			];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});

		it("parses statement with multiple pages of content after transactions", () => {
			let input = transactionsHeader
				.concat([
					"Card Number 0000 0000 0000 0000",
					"May 01",
					"ABCDEFG",
					"12.34",
					"11111111111111111111111"
				])
				.concat([
					"Page 5 of 10",
					"A-1  B-1  C-1",
					"ABCD/EFGH.IJK.LM.NOPQRS.TUVWXYZ1",
					" ",
					"Page 6 of 10",
					"A-1  B-2  I-2",
					"311",
					"Page 7 of 10",
					"A-1  B-3  I-3",
					"ABCD/EFGH.IJK.LM.NOPQRS.TUVWXYZ2",
					"311",
					"Page 8 of 10",
					"A-1  B-4  I-4",
					"311",
					"Page 9 of 10",
					"A-1  B-5  I-5",
					"ABCD/EFGH.IJK.LM.NOPQRS.TUVWXYZ3",
					"311",
					"Page 10 of 10",
					"A-1  B-6  I-6"
				]);
			let target = new StatementParser();

			let expected = [
				new StatementItem("0000 0000 0000 0000", "May 01", "ABCDEFG", "11111111111111111111111", "12.34", "")
			];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});

		it("parses payment amounts", () => {
			let input = transactionsHeader
				.concat([
					"Card Number 0000 0000 0000 0000",
					"May 01",
					"ABCDEFG",
					"12.34",
					"11111111111111111111111"
				])
				.concat([
					"Card Number 0000 0000 0000 0001",
					"May 01",
					"Payment",
					"-11.00",
					"ABCD11111111111111"
				])
				.concat([
					"Card Number 0000 0000 0000 0002",
					"May 01",
					"ABCDEFG",
					"43.21",
					"11111111111111111111111"
				])
				.concat([
					"Page 5 of 5",
					"A-1  B-1  C-1",
					"ABCD/EFGH.IJK.LM.NOPQRS.TUVWXYZ1",
				]);
			let target = new StatementParser();

			let expected = [
				new StatementItem("0000 0000 0000 0000", "May 01", "ABCDEFG", "11111111111111111111111", "12.34", ""),
				new StatementItem("0000 0000 0000 0001", "May 01", "Payment", "ABCD11111111111111", "-11.00", ""),
				new StatementItem("0000 0000 0000 0002", "May 01", "ABCDEFG", "11111111111111111111111", "43.21", "")
			];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});

		it("parses online Bpay payments", () => {
			let input = transactionsHeader
				.concat([
					"Card Number 0000 0000 0000 0000",
					"Jan 01",
					"ABCDEFG",
					"12.34",
					"11111111111111111111111"
				])
				.concat([
					"Jan 02",
					"Online Bpay",
					"56.78",
					"ABCDE111111A111111"
				])
				.concat([
					"Jan 03",
					"ABCDEFG",
					"43.21",
					"11111111111111111111111"
				])
				.concat(pageEnding)
				.concat(statementEnding);
			let target = new StatementParser();

			let expected = [
				new StatementItem("0000 0000 0000 0000", "Jan 01", "ABCDEFG", "11111111111111111111111", "12.34", ""),
				new StatementItem("0000 0000 0000 0000", "Jan 02", "Online Bpay", "ABCDE111111A111111", "56.78", ""),
				new StatementItem("0000 0000 0000 0000", "Jan 03", "ABCDEFG", "11111111111111111111111", "43.21", "")
			];
			let actual = target.parse(input);

			expect(actual).toEqual(expected);
		});
	});
});

let transactionsHeader = [
	"Transactions",
	"Date",
	"Transaction Details",
	"Reference Number",
	"Amount"
];
let transactionsContinuedHeader = [
	"Transactions (Continued)",
	"Date",
	"Transaction Details",
	"Reference Number",
	"Amount"
];
let pageEnding = [
	"(Continued next page)"
];
let alternatePageEnding = [
	"Page 3 of 4, October 2018"
];
let statementEnding = [
	"Closing Balance"
];