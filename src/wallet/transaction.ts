import uuid from 'uuid/v1';
import { Wallet } from './index';
import { verifySignature } from '../util/index';
import { REWARD_INPUT, MINING_REWARD } from '../config';

export class Transaction {

  id: string;
  outputMap: any;
  input: any;

  constructor(senderWallet?:Wallet, recipient?:string, amount?:number, outputMap?: any, input?: any){
    this.id = uuid();
    this.outputMap = outputMap || this.createOutputMap(senderWallet!!, recipient!!, amount!!);
    this.input = input || this.createInput(senderWallet!!, this.outputMap);
  }

  createOutputMap(senderWallet: Wallet, recipient: string, amount: number): any {
    const outputMap:any = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

    return outputMap;
  }

  createInput(senderWallet: Wallet, outputMap: any): any {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap)
    };
  }

  update(senderWallet: Wallet, recipient: string, amount: number): void {

    if(amount > this.outputMap[senderWallet.publicKey]){
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

    this.input = this.createInput(senderWallet, this.outputMap);
  }

  static validTransaction(transaction:Transaction): boolean{
    const {input: {address, amount, signature} , outputMap} = transaction;
    
    const outputTotal = Object.values(outputMap)
      .reduce((total: any, outputAmount: any) => total + outputAmount, 0);

    if(amount !== outputTotal){
      console.error(`Invalid transaction from ${address}`);
      return false;
    }

    if(!verifySignature( address, outputMap, signature)){
      console.error(`Invalid signature from ${address}`);
      return false;
    }

    return true;
  }

  static rewardTransaction(minerWallet: Wallet): Transaction {
    return new this(
      undefined,
      undefined,
      undefined,
      REWARD_INPUT,
      ({[minerWallet.publicKey]: MINING_REWARD})
    );
  }
}