import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {Blockchain} from './blockchain';

const SERVER_PORT = 3000;
const app = express();
const blockchain = new Blockchain();

app.use(bodyParser.json());

app.get('/api/blocks',(req: Request, res:Response) => {
  res.json(blockchain.chain);
});

app.post('/api/mine', (req:Request, res:Response) => {
  const {data} = req.body;

  blockchain.addBlock({data});

  res.redirect('/api/blocks');
});

app.listen(SERVER_PORT, () => {
  console.log(`Listening at localhost:${SERVER_PORT}`);
});