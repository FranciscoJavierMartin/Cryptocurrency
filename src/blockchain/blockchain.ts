import { Transaction } from './../wallet/transaction';
import {Block} from '../blockchain/block';
// import cryptoHash from './crypto-hash';
import {cryptoHash} from '../util';
import { REWARD_INPUT, MINING_REWARD } from '../config';
import { Wallet } from '../wallet';

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

  replaceChain(chain: Block[], validateTransactions: any, onSuccess: Function){
    if(chain.length > this.chain.length && Blockchain.isValidChain(chain)){
      this.chain = chain;
    }

    if(!this.validTransactionData({chain})){
      console.error('The incoming chain has invalid data');
      return;
    }

    if(validateTransactions && !this.validTransactionData({chain})){
      console.error('The incoming chain has invalid data');
      return;
    }

    if(!!onSuccess){
      onSuccess();
    }
  }

  validTransactionData({chain}: any): boolean{
    
    for(let i = 1; i<chain.length; i++){
      const block = chain[i];
      const transactionSet = new Set();
      let rewardTransactionCount = 0;

      for(let transaction of block.data){
        if(transaction.input.address === REWARD_INPUT.address){
          rewardTransactionCount++;

          // TODO: Find another approach
          if(rewardTransactionCount > 1){
            console.error('The incoming chain must be longer');
            return false;
          }

          if(Object.values(transaction.outputMap)[0] !== MINING_REWARD){
            console.error('Miner reward amount is invalid');
            return false;
          }

        } else {
          if(!Transaction.validTransaction(transaction)){
            console.error('Invalid transaction');
            return false;
          }

          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address
          });

          if(transaction.input.amount !== trueBalance){
            console.error('Invalid input amount');
            return false;
          }

          if(transactionSet.has(transaction)){
            console.error('An identical transaction appears more than once in the block');
            return false;
          } else {
            transactionSet.add(transaction);
          }

        }
      }
    }

    return true;
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