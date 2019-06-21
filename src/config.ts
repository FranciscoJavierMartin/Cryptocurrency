import {Block} from './blockchain/block';

export const MINE_RATE:number = 1000;
const INITIAL_DIFFICULTY:number = 3;

export const GENESIS_DATA: Block = {
  timestamp: 1,
  lastHash: '-----',
  hash: 'hash-one',
  difficulty: INITIAL_DIFFICULTY,
  nonce: 0,
  data: []
};

export const STARTING_BALANCE:number = 1000;

export const REWARD_INPUT = {
  address: '*authorized-reward*'
};

export const MINING_REWARD:number = 50;