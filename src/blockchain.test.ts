import {Blockchain} from './blockchain';
import {Block} from './block';
import cryptoHash from './crypto-hash';

describe('Blockchain', () => {
  let blockchain: Blockchain;
  let newChain:Blockchain;
  let originalChain:Block[];

  beforeEach(()=> {
    blockchain = new Blockchain();
    newChain = new Blockchain();
    originalChain = blockchain.chain;
  });

  it('starts with the genesis block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it('adds a new block to the chain', () => {
    const newData = 'foo bar';
    blockchain.addBlock({data: newData});

    expect(blockchain.chain[blockchain.chain.length -1].data).toEqual(newData);
  });

  describe('isValidChain()', () => {
    describe('when the chain does not start with the genesis block', () => {
      it('returns false', () => {
        blockchain.chain[0].data = 'fake-genesis';
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });

    describe('when the chain starts with the genesis block and has multiple blocks', () => {

      beforeEach(() => {
        blockchain.addBlock({data: 'Bears'});
        blockchain.addBlock({data: 'Beets'});
        blockchain.addBlock({data: 'Battlestar Galactica'});
      });

      describe('and a lastHash reference has changes', () => {
        it('returns false', () => {
          blockchain.chain[2].lastHash = 'broken-lastHash';
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain contains a block with an invalid field', () => {
        it('returns false', () => {
          blockchain.chain[2].data = 'some-bad-and-evil-data';
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain contains a block with a jumped difficulty', () => {
        it('returns false', () => {
          const lastBlock = blockchain.chain[blockchain.chain.length -1];
          const lastHash = lastBlock.hash;
          const timestamp = Date.now();
          const nonce = 0;
          const data: any = [];
          const difficulty = lastBlock.difficulty -3;

          const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

          const badBlock = new Block({
            timestamp,
            lastHash,
            hash,
            nonce,
            difficulty,
            data
          });

          blockchain.chain.push(badBlock);
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);

        });
      });

      describe('and the chain does not contain any invalid blocks', () => {
        it('returns true', () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });


  describe('replaceChain()', () => {
    describe('when the new chain is not longer', () => {
      beforeEach(() => {
        newChain.chain[0].data = 'chain';
        blockchain.replaceChain(newChain.chain);
      });
    });

    describe('when the new chain is longer', () => {
      beforeEach(() => {
        newChain.addBlock({data: 'Bears'});
        newChain.addBlock({data: 'Beets'});
        newChain.addBlock({data: 'Battlestar Galactica'});
      });

      describe('and the chain is invalid', () => {
        beforeEach(() => {
          newChain.chain[2].hash = 'some-fake-hash';
          blockchain.replaceChain(newChain.chain);
        });

        it('does not replace the chain', () => {
          expect(blockchain.chain).toEqual(originalChain);
        });
      });

      describe('and the chain is valid', () => {
        beforeEach(() => {
          blockchain.replaceChain(newChain.chain);
        });

        it('replaces the chain', () => {
          expect(blockchain.chain).toEqual(newChain.chain);
        });
      });
    });
  });
});