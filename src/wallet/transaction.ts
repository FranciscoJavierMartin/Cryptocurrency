import uuid from 'uuid/v1';
import { Wallet } from './index';
import { verifySignature } from '../util/index';

export class Transaction {

  id: any;
  outputMap: any;
  input: any;

  constructor({senderWallet, recipient, amount}:{senderWallet:Wallet,recipient:string,amount:number}){
    this.id = uuid();
    this.outputMap = this.createOutputMap({senderWallet, recipient, amount});
    this.input = this.createInput({senderWallet, outputMap: this.outputMap});
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

  static validTransaction(transaction:any){
    const {input: {address, amount, signature} , outputMap} = transaction;
    
    const outputTotal = Object.values(outputMap)
      .reduce((total: number, outputAmount: number) => total + outputAmount);

    it(amount !== outputTotal){
      console.error(`Invalid transaction from ${address}`);
      return false;
    }

    if(!verifySignature({publicKey: address, data: outputMap, signature})){
      console.error(`Invalid signature from ${address}`);
      return false;
    }

    return true;
  }
}