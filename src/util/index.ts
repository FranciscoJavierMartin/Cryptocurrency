const lookup:any = {
  '0': '0000',
  '1': '0001',
  '2': '0010',
  '3': '0011',
  '4': '0100',
  '5': '0101',
  '6': '0110',
  '7': '0111',
  '8': '1000',
  '9': '1001',
  'a': '1010',
  'b': '1011',
  'c': '1100',
  'd': '1101',
  'e': '1110',
  'f': '1111',
  'A': '1010',
  'B': '1011',
  'C': '1100',
  'D': '1101',
  'E': '1110',
  'F': '1111'
};

// TODO: Refactor to ES6
export function hexToBinary(s:string):string {
    let ret = '';

    for (let i = 0, len = s.length; i < len; i++) {
        ret += lookup[s[i]];
    }
    return ret;
}

 const crypto = require('crypto');

 export const cryptoHash = (...inputs:any[]) => {
    const hash = crypto.createHash('sha256');

    hash.update(inputs.sort().join(' '));

    return hash.digest('hex');
};

// export crypto;

// import {ec as EC} from 'elliptic';
const EC = require('elliptic').ec;

export const ec = new EC('secp256k1');

export const verifySignature = ({publicKey, data, signature}: {publicKey: any, data: any, signature: any}) =>{
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');

    return keyFromPublic.verify(cryptoHash(data), signature);
};