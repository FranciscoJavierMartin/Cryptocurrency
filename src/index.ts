import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import request from 'request';
import {Blockchain} from './blockchain';
import {PubSub} from './pubsub';

const DEFAULT_PORT = 3000;

const syncChains = () => {
  request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
    if(!error && response.statusCode === 200){
      const rootChain = JSON.parse(body);
      
      blockchain.replaceChain(rootChain);
    }
  });
}

let PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true'){
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random()*1000);
}

let SERVER_PORT = PEER_PORT || DEFAULT_PORT;

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({blockchain});

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());

app.get('/api/blocks',(req: Request, res:Response) => {
  res.json(blockchain.chain);
});

app.post('/api/mine', (req:Request, res:Response) => {
  const {data} = req.body;

  blockchain.addBlock({data});

  pubsub.broadcastChain();

  res.redirect('/api/blocks');
});



app.listen(SERVER_PORT, () => {
  console.log(`Listening at localhost:${SERVER_PORT}`);

  if(SERVER_PORT !== DEFAULT_PORT){
    syncChains();
  }
});