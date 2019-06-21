import { Transaction } from './../wallet/transaction';
import { Blockchain } from "../blockchain/blockchain";
import { TransactionPool } from "../wallet/transaction-pool";
import { Wallet } from "../wallet";
import { PubSub } from "./pubsub";

export class TransactionMiner {

  public blockchain: Blockchain;
  public transactionPool: TransactionPool;
  public wallet: Wallet;
  public pubsub: PubSub;

  constructor(blockchain: Blockchain, transactionPool: TransactionPool, wallet: Wallet, pubsub: PubSub){
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }
  
  mineTransaction(): void{
    const validTransactions = this.transactionPool.validTransactions();
    
    validTransactions.push(
      Transaction.rewardTransaction(this.wallet)
    );

    this.blockchain.addBlock(validTransactions);
    this.pubsub.broadcastChain();

    this.transactionPool.clear();
  }
}