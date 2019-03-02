import { STARTING_BALANCE } from '../config';
import { ec, cryptoHash } from '../util';

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

};