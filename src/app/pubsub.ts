import redis, { RedisClient } from 'redis';
import { Blockchain } from '../blockchain/blockchain';
import { TransactionPool } from '../wallet/transaction-pool';
import { Transaction } from '../wallet/transaction';

const CHANNELS ={
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
};

export class PubSub {

  publisher: RedisClient;
  subscriber: RedisClient;
  blockchain: Blockchain;
  transactionPool: TransactionPool;

  constructor({blockchain, transactionPool}: {blockchain: Blockchain, transactionPool: TransactionPool}) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;

    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.subscribeToChannels();
    
    this.subscriber.on('message', (channel:string, message:string) => {
      this.handleMessage(channel,message);
    });
  }

  handleMessage(channel: string, message: string){
    const parsedMessage = JSON.parse(message);

    switch(channel){
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage, true, () => {
          this.transactionPool.clearBlockchainTransactions({
            chain: parsedMessage
          });
        });
        break;
      case CHANNELS.TRANSACTION:
        this.transactionPool.setTransaction(parsedMessage);
        break;
    }

  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach(channel => {
      this.subscriber.subscribe(channel);
    });
  }

  publish({channel, message}:{channel:string,message:string}){
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  }

  broadcastChain():void{
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }

  broadcastTransaction(transaction: Transaction){
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
    });
  }
}