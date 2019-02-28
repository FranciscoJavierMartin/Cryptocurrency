import {Block} from './block';
import cryptoHash from './crypto-hash.js';

export class Blockchain {

  public chain: Block[];

  constructor(){
    this.chain = [Block.genesis()];
  }

  addBlock({data}:any){
    const newBlock:Block = Block.mineBlock({
      lastBlock: this.chain[this.chain.length-1],
      data
    });

    this.chain.push(newBlock);
  }

  replaceChain(chain: Block[]){
    if(chain.length > this.chain.length && Blockchain.isValidChain(chain)){
      this.chain = chain;
    }
  }

  static isValidChain(chain: Block[]){
    let isValid = JSON.stringify(chain[0]) === JSON.stringify(Block.genesis());

    if(isValid){
      for(let i = 1; i < chain.length && isValid; i++){
        const block = chain[i];
        const actualLastHash = chain[i-1].hash;
        const lastDifficulty = chain[i-1].difficulty;
        const {timestamp,lastHash, hash, nonce, difficulty, data} = block;
        const validateHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

        isValid = isValid && (
          lastHash === actualLastHash &&
          hash === validateHash &&
          (Math.abs(lastDifficulty - difficulty) <= 1)
        );
      }
    }

    return isValid;
  }
}