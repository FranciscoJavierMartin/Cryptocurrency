import { hexToBinary,cryptoHash } from '../util';
import { GENESIS_DATA, MINE_RATE } from '../config';
import { Transaction } from '../wallet/transaction';
// import cryptoHash from './crypto-hash';

export class Block {
  
  timestamp:number;
  lastHash:string;
  hash:string;
  data: Transaction [];
  nonce:number;
  difficulty:number;

  constructor({timestamp, lastHash, hash, data, nonce, difficulty}: Block) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  static genesis(): Block {
    return new this(GENESIS_DATA);
  }

  static mineBlock(lastBlock: Block, data: Transaction[]): Block {
    let hash: string, timestamp: number;
    const lastHash = lastBlock.hash;
    let { difficulty } = lastBlock;
    let nonce = 0;

    do{
      nonce ++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty(lastBlock, timestamp);
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
    } while(hexToBinary(hash).substring(0,difficulty) !== '0'.repeat(difficulty));

    return new this({
      timestamp,
      lastHash,
      data,
      difficulty,
      nonce,
      hash
    });
  }

  static adjustDifficulty(originalBlock: Block, timestamp: number){
    const { difficulty } = originalBlock;
    const difference = timestamp - originalBlock.timestamp;
    let newDifficulty = difference > MINE_RATE ? difficulty - 1 : difficulty + 1;

    if(difficulty <1){
      newDifficulty = 1;
    }else if(difference > MINE_RATE){
      newDifficulty = difficulty -1;
    }else {
      newDifficulty = difficulty +1;
    }

    return newDifficulty;
  }

}