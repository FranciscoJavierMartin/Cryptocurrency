import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import request from 'request';
import {Blockchain} from './blockchain/blockchain';
import {PubSub} from './app/pubsub';
import { TransactionPool } from './wallet/transaction-pool';
import { Wallet } from './wallet';
import { TransactionMiner } from './app/transaction-miner';
import * as path from 'path';
const DEFAULT_PORT = 3000;

const syncWithRootState = () => {
  request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
    if(!error && response.statusCode === 200){
      const rootChain = JSON.parse(body);
      
      blockchain.replaceChain(rootChain);
    }
  });

  request({
    url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map`}, (error, response, body) => {
      if(!error && response.statusCode === 200){
        const rootTransactionPoolMap = JSON.parse(body);
        transactionPool.setMap(rootTransactionPoolMap);
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
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({blockchain, transactionPool});
const transactionMiner = new TransactionMiner({blockchain, transactionPool, wallet, pubsub});

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'dist/client')));

app.get('/api/blocks',(req: Request, res:Response) => {
  res.json(blockchain.chain);
});

app.post('/api/mine', (req:Request, res:Response) => {
  const {data} = req.body;

  blockchain.addBlock({data});

  pubsub.broadcastChain();

  res.redirect('/api/blocks');
});

app.post('/api/transact', (req: Request, res: Response) => {
  const {amount, recipient} = req.body;
  let transaction = transactionPool
    .existingTransaction({inputAddress: wallet.publicKey});

  try{

    if(transaction){
      transaction.update({senderWallet: wallet, recipient, amount});
    }else{
      transaction = wallet.createTransaction({recipient,amount, chain: blockchain.chain});
    }

    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction);
  
    res.json({ type: 'success', transaction});

  }catch(error){
    res.status(400).json({type: 'error', message: error.message});
  }

});

app.get('/api/transaction-pool-map', (req:Request, res: Response) => {
  res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req: Request, res: Response) => {
  transactionMiner.mineTransaction();
  res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req: Request, res: Response) => {
  const address = wallet.publicKey;
  res.json({
    address,
    balance: Wallet.calculateBalance({chain: blockchain.chain, address}),
  });
});

app.get('*', (req: Request, res: Response)=> {
  res.sendFile(path.join(__dirname,'dist/client/index.html'));
});

const walletFoo = new Wallet();
const walletBar = new Wallet();

const generateWalletTransaction = ({
  wallet, recipient, amount
}) => {
  const transaction = wallet.createTransaction({
    recipient, amount, chain: blockchain.chain
  });

  transactionPool.setTransaction(transaction);
};

const walletAction = () => generateWalletTransaction({
  wallet, recipient: walletFoo.publicKey, amount: 5
});

const walletFooAction = () => generateWalletTransaction({
  wallet: walletFoo, recipient: walletBar.publicKey, amount: 10
});

const walletBarAction = () => generateWalletTransaction({
  wallet: walletBar, recipient: wallet.publicKey, amount: 15
});

for(let i =0; i<10; i++){
  if(i%3===0){
    walletAction();
    walletFooAction();
  } else if(i%3===1){
    walletAction();
    walletBarAction();
  } else {
    walletFooAction();
    walletBarAction();
  }

  transactionMiner.mineTransaction();
}

app.listen(SERVER_PORT, () => {
  console.log(`Listening at localhost:${SERVER_PORT}`);

  if(SERVER_PORT !== DEFAULT_PORT){
    syncWithRootState();
  }
});