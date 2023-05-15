import express from 'express';
import compression from 'compression';
import cors from 'cors';
import path from 'path';
import fs, { readFileSync } from 'fs';
import * as dotenv from 'dotenv';
import https from 'https';
import * as mongoose from 'mongoose';
import { CONTRACTS, NETWORK_IDS } from 'contracts';
import userRouter from './routes/userRoute';
import eventRouter from './routes/eventRoute';
import nftStatusRouter from './routes/nftStatusRoute';
import nftRouter from './routes/nftRoute';
import priceRouter from './routes/priceRoute';
import offerRouter from './routes/offerRoute';
import searchRouter from './routes/searchRoute';
import ipfsRouter from './routes/ipfsRoute';
import bidRouter from './routes/bidRoute';
import shoppingListRouter from './routes/shoppingListRoute';
import { apiBaseURL } from './constants';
import { deleteOldOffers, fetchEthPrice, fetchMarketplaceEvents, finishAuctions } from './utils';
import Event from './models/event';
import NftStatus from './models/nft_status';
import { importRandomNfts } from './scripts';

if (+process.versions.node.split('.')[0] < 18) {
  throw new Error('Node version must be 18 or higher');
}

dotenv.config();
const dirname = path.resolve();

const app = express();
app.use(compression());
app.use(cors());
const port = 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(userRouter);
app.use(eventRouter);
app.use(nftStatusRouter);
app.use(nftRouter);
app.use(priceRouter);
app.use(offerRouter);
app.use(searchRouter);
app.use(ipfsRouter);
app.use(shoppingListRouter);
app.use(bidRouter);

['/assets', '/assets/images', '/assets/nfts'].forEach(dir => {
  if (!fs.existsSync(`${dirname}${dir}`)) {
    fs.mkdirSync(`${dirname}${dir}`);
  }
});

app.use('/assets', express.static(path.join(dirname, '/assets')));

(async () => {
  await mongoose.connect(process.env.MONGO_URI, {});
  if (process.env.NODE_ENV !== 'production') await Promise.all([Event.deleteMany({}), NftStatus.deleteMany({}), importRandomNfts()]);

  setInterval(async () => {
    try {
      if (process.env.NODE_ENV === 'production') {
        const chainIds = Object.keys(CONTRACTS).filter(chainId => chainId !== NETWORK_IDS.LOCALHOST);
        await Promise.all(chainIds.map(chainId => fetchMarketplaceEvents(chainId)));
        await Promise.all(chainIds.map(chainId => finishAuctions(chainId)));
      } else {
        await fetchMarketplaceEvents(NETWORK_IDS.LOCALHOST);
        await finishAuctions(NETWORK_IDS.LOCALHOST);
      }
    } catch (err) {
      console.log(err);
    }
  }, 1000 * 5);
  setInterval(fetchEthPrice, 1000 * 10);
  setInterval(deleteOldOffers, 1000 * 5);
})();
if (apiBaseURL.includes('localhost')) {
  app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`)); // eslint-disable-line
} else {
  https
    .createServer(
      // Provide the private and public key to the server by reading each
      // file's content with the readFileSync() method.
      {
        key: readFileSync('./privkey.pem'),
        cert: readFileSync('./fullchain.pem')
      },
      app
    )
    .listen(port, () => {
      console.log(`server is running at port ${port}`);
    });
}
