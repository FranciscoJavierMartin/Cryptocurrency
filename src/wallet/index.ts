import { STARTING_BALANCE } from '../config';
import { ec, cryptoHash } from '../util';
import { Transaction } from './transaction';

export class Wallet {

  balance: number;
  publicKey: any;
  keyPair: any;

  constructor(){
    this.balance = STARTING_BALANCE;
    console.log('EC:',ec);
    this.keyPair = ec.genKeyPair();
    console.log('KeyPair:',this.keyPair);

    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  sign(data:any) {
    return this.keyPair.sign(cryptoHash(data));
  }

  createTransaction({recipient, amount, chain}:any){
    if(chain) {
      this.balance = Wallet.calculateBalance({
        chain,
        address: this.publicKey
      });
    }
    if(amount > this.balance){
      throw new Error('Amount exceeds balance');
    }

    return new Transaction({senderWallet: this, recipient, amount});
  }

  static calculateBalance({chain, address}: any){
    let hasConductedTransaction = false;
    let outputsTotal = 0;

    for(let i = chain.length -1; i > 0; i--){
      const block = chain[i];

      for(let transaction of block.data){
        if(transaction.input.address === address){
          hasConductedTransaction = true;
        }
        const addressOutput = transaction.outputMap[address];

        if(addressOutput){
          outputsTotal = outputsTotal + addressOutput;
        }
      }

      // TODO: Find another approach
      if(hasConductedTransaction){
        break;
      }
    }

    
    return hasConductedTransaction ? outputsTotal : STARTING_BALANCE + outputsTotal;
  }

};