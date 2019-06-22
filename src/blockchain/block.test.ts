import { hexToBinary, cryptoHash } from '../util';
import { Block} from './block';
// import cryptoHash from './crypto-hash';
import { GENESIS_DATA, MINE_RATE } from '../config';

describe('Block', () => {
  const timestamp = 2000;
  const lastHash = 'foo-hash';
  const hash = 'bar-hash';
  const data = ['blockchain', 'data'];
  const nonce = 1;
  const difficulty = 1;

  const block = new Block({
    timestamp,
    lastHash,
    hash,
    data,
    nonce,
    difficulty
  });

  describe('genesis()', () => {
    const genesisBlock: Block = Block.genesis();

    it('returns the genesis data', () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });

  describe('mineBlock()', () => {
    const lastBlock = Block.genesis();
    const data = 'mined data';
    const minedBlock: Block = Block.mineBlock(lastBlock, data);

    it('sets the `lastHash` to be the `hash` of the lastBlock', () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash);
    });

    it('sets the `data`', () => {
      expect(minedBlock.data).toEqual(data);
    });

    it('sets a `timestamp`', () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });

    it('creates a SHA-256 `hash` based on the proper inputs', () => {
      expect(minedBlock.hash)
        .toEqual(cryptoHash(
          minedBlock.timestamp,
          minedBlock.nonce,
          minedBlock.difficulty,
          lastBlock.hash,
          data
        ));
    });

    it('sets a `hash` that matches the difficulty criterian', () => {
      expect(hexToBinary(minedBlock.hash).substring(0,minedBlock.difficulty))
        .toEqual('0'.repeat(minedBlock.difficulty));
    });

    it('adjust the difficulty', () => {
      const possibleResults: number[] = [lastBlock.difficulty + 1, lastBlock.difficulty -1];
      expect(possibleResults.includes(minedBlock.difficulty));
    });

  });

  describe('adjustDifficulty()', () => {
    it('raises the difficulty for a quickly mined block', () => {
      expect(Block.adjustDifficulty(
        block,
        block.timestamp + MINE_RATE - 100
      )).toEqual(block.difficulty+1);
    });

    it('lowers the difficulty for a slowly mined block', () => {
      expect(Block.adjustDifficulty(
        block,
        block.timestamp + MINE_RATE + 100
      )).toEqual(block.difficulty -1);
    });

    it('has a lower limit of 1', () => {
      block.difficulty = -1;
      expect(Block.adjustDifficulty(block, block.timestamp + MINE_RATE + 100)).toEqual(1);
    });
  });
});