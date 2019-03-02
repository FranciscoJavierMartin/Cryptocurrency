import {Block} from './blockchain/block';

export const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 3;

export const GENESIS_DATA: Block = {
  timestamp: 1,
  lastHash: '-----',
  hash: 'hash-one',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: []
};