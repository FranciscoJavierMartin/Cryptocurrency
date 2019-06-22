import { Blockchain } from './../blockchain/blockchain';
import {Wallet} from './index';
import {verifySignature} from '../util';
import { Transaction } from './transaction';
import { STARTING_BALANCE } from '../config';

describe('Wallet',() => {
  let wallet: Wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  describe('signing data', () => {
    const data = 'foobar';

    it('verifies a signature', () => {
      expect(verifySignature(wallet.publicKey, data, wallet.sign(data))).toBe(true);
    });

    it('does not verify an invalid signature', () => {
      expect(
        verifySignature(
          wallet.publicKey,
          data,
          wallet.sign(data)
        )
      ).toBe(false);
    });
  });

  describe('createTransaction()', () => {
    describe('and the amount exceeds the balance', () => {
      it('throws and error', () => {
        expect(() => wallet.createTransaction('foo-recipient', 999999))
          .toThrow('Amount exceeds balance');
      });
    });

    describe('and the amount is valid', () => {
      let transaction: Transaction;
      let amount: number;
      let recipient: string;

      beforeEach(() => {
        amount = 50;
        recipient = 'foo-recipient';
        transaction = wallet.createTransaction(recipient, amount);
      });

      it('matches the transaction input with the wallet', () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });

      it('outputs the amount the recipient', () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
      });

    });

    describe('and a chain is passed', () => {
      it('calls `Wallet.calculateBalance`', () => {
        const calculateBalanceMock = jest.fn();
        const originalCalculateBalance = Wallet.calculateBalance;

        Wallet.calculateBalance = calculateBalanceMock;
        wallet.createTransaction('foo',10, new Blockchain().chain);

        expect(calculateBalanceMock).toHaveBeenCalled();
        Wallet.calculateBalance = originalCalculateBalance;
      });
    });
  });

  describe('calculateBalance()', () => {
    let blockchain: Blockchain;

    beforeAll(() => {
      blockchain = new Blockchain();
    });

    describe('and there are no outputs for the wallet', () => {
      it('returns the `STARTING_BALANCE`', () => {
        expect(
          Wallet.calculateBalance(
            blockchain.chain,
            wallet.publicKey)
        ).toEqual(STARTING_BALANCE)
       
      });
    });

    describe('and there are outputs for the wallet', () => {
      let transactionOne: Transaction, transactionTwo: Transaction;

      beforeEach(() => {
        transactionOne = new Wallet().createTransaction(wallet.publicKey, 50);
        transactionTwo = new Wallet().createTransaction(wallet.publicKey, 60);

        blockchain.addBlock([transactionOne, transactionTwo]);
      });

      it('adds  the sum of all outputs to the wallet balance', () => {
        expect(
          Wallet.calculateBalance(
            blockchain.chain,
            wallet.publicKey
          )
        ).toEqual(STARTING_BALANCE + 
          transactionOne.outputMap[wallet.publicKey] +
          transactionTwo.outputMap[wallet.publicKey]);
      });

      describe('and the wallet has made a transaction', () => {
        let recentTransaction: Transaction;

        beforeEach(() => {
          recentTransaction = wallet.createTransaction('foo-address', 30);
          blockchain.addBlock([recentTransaction]);
        });

        it('returns the output amount of the recent transaction', () => {
          expect(
            Wallet.calculateBalance(blockchain.chain, wallet.publicKey)
          ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
        });

        describe('and there are outputs next to and after the recent transaction', () => {
          let sameBlockTransaction: Transaction, nextBlockTransaction: Transaction;

          beforeEach(() => {
            recentTransaction = wallet.createTransaction('later-foo-address', 60);
          });

          sameBlockTransaction = Transaction.rewardTransaction( wallet);
          blockchain.addBlock([recentTransaction, sameBlockTransaction]);

          nextBlockTransaction = new Wallet().createTransaction( wallet.publicKey, 75);
          blockchain.addBlock([nextBlockTransaction]);

          it('include the output amount in the returned balance', () => {
            expect(
              Wallet.calculateBalance(blockchain.chain, wallet.publicKey)
            ).toEqual(
              recentTransaction.outputMap[wallet.publicKey] +
              sameBlockTransaction.outputMap[wallet.publicKey] +
              nextBlockTransaction.outputMap[wallet.publicKey]
            );
          });
        });
       
      });

    });
    
  });
});