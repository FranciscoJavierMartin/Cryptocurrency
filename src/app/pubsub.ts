import redis, { RedisClient } from 'redis';
import { Blockchain } from '../blockchain/blockchain';

const CHANNELS ={
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN'
};

export class PubSub {

  publisher: RedisClient;
  subscriber: RedisClient;
  blockchain: Blockchain;

  constructor({blockchain}: {blockchain: Blockchain}) {
    this.blockchain = blockchain;
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.subscribeToChannels();
    
    this.subscriber.on('message', (channel:string, message:string) => {
      this.handleMessage(channel,message);
    });
  }

  handleMessage(channel: string, message: string){
    const parsedMessage = JSON.parse(message);

    if(channel == CHANNELS.BLOCKCHAIN){
      this.blockchain.replaceChain(parsedMessage);
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
    })
  }
}