import {Blockchain} from './blockchain';

const blockchain = new Blockchain();

blockchain.addBlock({data: 'initial'});

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, averave;

const times = [];

for(let i = 0; i<10000; i++){
  prevTimestamp = blockchain.chain[blockchain.chain.length-1].timestamp;

  blockchain.addBlock({data: `block ${i}`});
  nextBlock = blockchain.chain[blockchain.chain.length -1];

  nextTimestamp = nextBlock.timestamp;
  timeDiff = nextTimestamp - prevTimestamp;
  times.push(timeDiff);

  averave = times.reduce((total, num) => (total + num)) / times.length;
}