import {Wallet} from './index';
import {verifySignature} from '../util';

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
});