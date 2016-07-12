import StatementItem from "./../StatementItem";

export default class StatementParser {

	public parse(statementText: string[]): StatementItem[] {
		let items = [],
			cardNumber = null,
			startIndex = this.indexOfNextTransactionRow(statementText, 0);

		while (startIndex > -1)
		{
			let index = startIndex;
			
			while (index < statementText.length) {
				if (this.textIsCardNumber(statementText[index])) {
					cardNumber = this.parseCardNumber(statementText[index]);
					index += 1;
				}

				if (this.textIsInternationTransanctionFee(statementText[index])) {
					index += 1;
				}

				if (this.textIsRowEnding(statementText[index]) ||
					this.textIsTransactionsEnd(statementText[index])) {
					break;
				}

				let date = statementText[index],
					transactionDetails = statementText[index + 1],
					amount = statementText[index + 2],
					referenceNumber = statementText[index + 3],
					foreignCurrencyAmount = "";
				
				index += 4;

				if (this.textIsForeignCurrencyAmount(statementText[index])) {
					foreignCurrencyAmount = statementText[index];
					index += 1;
				}

				items.push(new StatementItem(cardNumber, date, transactionDetails, referenceNumber, amount, foreignCurrencyAmount));
			}

			startIndex = this.indexOfNextTransactionRow(statementText, index);
		}

		return items;
	}

	private indexOfNextTransactionRow(statementText: string[], searchFrom: number): number {
		let index = -1;

		for (let i = searchFrom; i < statementText.length; i++) {
			if ((statementText[i] == "Transactions" || statementText[i] == "Transactions (Continued)")&&
				statementText[i + 1] == "Date" &&
				statementText[i + 2] == "Transaction Details" &&
				statementText[i + 3] == "Reference Number" &&
				statementText[i + 4] == "Amount")
			{
				return i + 5;
			}
		}

		return index;
	}

	private textIsCardNumber(text: string): boolean {
		return /Card Number (\d\d\d\d \d\d\d\d \d\d\d\d \d\d\d\d)/.test(text);
	}

	private parseCardNumber(text: string): string {
		return text.match(/Card Number (\d\d\d\d \d\d\d\d \d\d\d\d \d\d\d\d)/)[1];
	}

	private textIsRowEnding(text: string): boolean {
		return text === "(Continued next page)";
	}

	private textIsTransactionsEnd(text: string): boolean {
		return text === "Closing Balance";
	}

	private textIsForeignCurrencyAmount(text: string): boolean {
		return text.startsWith("Foreign Amount ");
	}

	private textIsInternationTransanctionFee(text: string): boolean {
		return /AUD (\d)*.\d\d includes International Transaction fee AUD (\d)*.\d\d/.test(text);
	}
}