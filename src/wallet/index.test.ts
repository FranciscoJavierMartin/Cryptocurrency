import {Wallet} from './index';
import {verifySignature} from '../util';
import { Transaction } from './transaction';

describe('Wallet',() => {
  let wallet: Wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  describe('signing data', () => {
    const data = 'foobar';

    it('verifies a signature', () => {

      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data)
        })
      ).toBe(true);
    });

    it('does not verify an invalid signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data)
        })
      ).toBe(false);
    });
  });

  describe('createTransaction()', () => {
    describe('and the amount exceeds the balance', () => {
      it('throws and error', () => {
        expect(() => wallet.createTransaction({amount: 999999, recipient: 'foo-recipient'}))
          .toThrow('Amount exceeds balance');
      });
    });

    describe('and the amount is valid', () => {
      let transaction: Transaction;
      let amount: number;
      let recipient: any;

      beforeEach(() => {
        amount = 50;
        recipient = 'foo-recipient';
        transaction = wallet.createTransaction({ amount, recipient});
      });

      it('matches the transaction input with the wallet', () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });

      it('outputs the amount the recipient', () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
      });
    });
  });
});