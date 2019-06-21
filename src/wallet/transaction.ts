import uuid from 'uuid/v1';
import { Wallet } from './index';
import { verifySignature } from '../util/index';
import { REWARD_INPUT, MINING_REWARD } from '../config';

export class Transaction {

  id: any;
  outputMap: any;
  input: any;

  constructor({senderWallet, recipient, amount, outputMap, input}:{senderWallet:Wallet,recipient:string,amount:number}){
    this.id = uuid();
    this.outputMap = outputMap || this.createOutputMap({senderWallet, recipient, amount});
    this.input = input || this.createInput({senderWallet, outputMap: this.outputMap});
  }

  createOutputMap({senderWallet, recipient, amount}:any){
    const outputMap:any = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance -amount;

    return outputMap;
  }

  createInput({senderWallet, outputMap}:any){
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap)
    };
  }

  update({senderWallet, recipient, amount}:any){

    if(amount > this.outputMap[senderWallet.publickKey]){
      throw new Error('Amount exceeds balance');
    }

    if(!this.outputMap[recipient]){
      this.outputMap[recipient] = amount;
    } else {
      this.outputMap[recipient] = this.outputMap[recipient] + amount;
    }

    this.outputMap[recipient] = amount;
    this.outputMap[senderWallet.publicKey] =
      this.outputMap[senderWallet.publicKey] - amount;

    this.input = this.createInput({senderWallet, outputMap: this.outputMap});
  }

  static validTransaction(transaction:any){
    const {input: {address, amount, signature} , outputMap} = transaction;
    
    const outputTotal = Object.values(outputMap)
      .reduce((total: number, outputAmount: number) => total + outputAmount);

    if(amount !== outputTotal){
      console.error(`Invalid transaction from ${address}`);
      return false;
    }

    if(!verifySignature({publicKey: address, data: outputMap, signature})){
      console.error(`Invalid signature from ${address}`);
      return false;
    }

    return true;
  }

  static rewardTransaction({minerWallet}){
    return new this({
      input: REWARD_INPUT,
      outputMap: {[minerWallet.publicKey]: MINING_REWARD}
    });
  }
}