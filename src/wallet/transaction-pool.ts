import { Transaction } from "./transaction";

export class TransactionPool{

  transactionMap: any;

  constructor() {
    this.transactionMap = {};
  }

  setTransaction(transaction: Transaction){
    this.transactionMap[transaction.id] = transaction;
  }

  setMap(transactionMap){
    this.transactionMap = transactionMap;
  }

  existingTransaction({inputAddress}){
    const transactions = Object.values(this.transactionMap);

    return transactions.find((transaction: Transaction) => 
      transaction.id === inputAddress
    );
  }

  validTransactions(){
    return Object.values(this.transactionMap).filter((transaction:Transaction) => {
      return Transaction.validTransaction(transaction);
    });
  }

  // TODO: check it if correct
  clear(){
    this.transactionMap = {};
  }
}