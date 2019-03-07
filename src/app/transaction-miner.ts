import { Blockchain } from "../blockchain/blockchain";
import { TransactionPool } from "../wallet/transaction-pool";
import { Wallet } from "../wallet";
import { PubSub } from "./pubsub";

export class TransactionMiner {

  public blockchain: Blockchain;
  public transactionPool: TransactionPool;
  public wallet: Wallet;
  public pubsub: PubSub;

  constructor({blockchain,transactionPool, wallet, pubsub}: any){
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }
  
  mineTransaction(){

  }
}