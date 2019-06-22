import { Transaction } from "./transaction";
import { Block } from "../blockchain/block";

export class TransactionPool{

  transactionMap: any;

  constructor() {
    this.transactionMap = {};
  }

  setTransaction(transaction: Transaction):void {
    this.transactionMap[transaction.id] = transaction;
  }

  setMap(transactionMap: any): void {
    this.transactionMap = transactionMap;
  }

  existingTransaction(inputAddress: string): Transaction | undefined{
    const transactions: Transaction[] = Object.values(this.transactionMap);

    return transactions.find((transaction: Transaction) =>
      transaction.id === inputAddress
    );
  }

  validTransactions(): Transaction[] {
    const transactions: Transaction[] = Object.values(this.transactionMap);
    return transactions.filter((transaction:Transaction) =>
      Transaction.validTransaction(transaction)
    );
  }

  clear(): void{
    this.transactionMap = {};
  }

  clearBlockchainTransactions(chain: Block[]): void {
    
    for(let i = 1; i<chain.length; i++){
      const block = chain[i];

      for(let transaction of block.data){
        if(this.transactionMap[transaction.id]){
          delete this.transactionMap[transaction.id];
        }
      }
    }

  }

}