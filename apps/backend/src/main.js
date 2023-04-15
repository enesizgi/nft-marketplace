import express from 'express';
import compression from 'compression';
import multer from 'multer';
import cors from 'cors';
import { Web3Storage, getFilesFromPath } from 'web3.storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs, { readFileSync } from 'fs';
import { writeFile, readFile } from 'fs/promises';
import * as dotenv from 'dotenv';
import https from 'https';
import * as mongoose from 'mongoose';
import { CONTRACTS, NETWORK_IDS } from 'contracts';
import Nft from './models/nft';
import Metadata from './models/metadata';
import userRouter from './routes/userRoute';
import eventRouter from './routes/eventRoute';
import nftStatusRouter from './routes/nftStatusRoute';
import nftRouter from './routes/nftRoute';
import priceRouter from './routes/priceRoute';
import offerRouter from './routes/offerRoute';
import { apiBaseURL, apiProtocol } from './constants';
import { deleteOldOffers, fetchEthPrice, fetchMarketplaceEvents } from './utils';
import Event from './models/event';
import NftStatus from './models/nft_status';

if (+process.versions.node.split('.')[0] < 18) {
  throw new Error('Node version must be 18 or higher');
}

dotenv.config();
const dirname = path.resolve();
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'assets/nfts');
  },
  filename(req, file, cb) {
    const uniqueName = uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
    const extension = file.originalname.includes('.') ? file.originalname.split('.').pop() : '';
    const filename = extension.length > 0 ? `${uniqueName}.${extension}` : uniqueName;
    cb(null, filename);
  }
});
const upload = multer({ storage });

const client = new Web3Storage({ token: process.env.WEB3_STORAGE_API_TOKEN });
const app = express();
app.use(compression());
app.use(cors());
const port = 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/upload-to-ipfs', upload.array('files'), async (req, res) => {
  try {
    const imageFile = await getFilesFromPath([req.files[0].path]);
    const metadataCid = await client.put(imageFile, { wrapWithDirectory: false });
    const imageFilePath = req.files[0].path.split('/');
    const metadata = { ...JSON.parse(req.query.metadata), image: `https://w3s.link/ipfs/${metadataCid}` };
    await Metadata.findOneAndUpdate({ cid: metadataCid }, { $set: { cid: metadataCid, ...metadata } }, { upsert: true });
    await writeFile(`${dirname}/assets/nfts/${req.files[0].filename}.json`, JSON.stringify(metadata));
    const metadataFile = await getFilesFromPath([`${dirname}/assets/nfts/${req.files[0].filename}.json`]);
    const cid = await client.put(metadataFile, { wrapWithDirectory: false });

    res.json({ ...metadata, cid, url: `${apiProtocol}://${apiBaseURL}/${req.files[0].path}` });
    try {
      const metadataFilePath = `assets/nfts/${req.files[0].filename}.json`.split('/');

      await Nft.insertMany([
        {
          cid,
          path: JSON.stringify(imageFilePath)
        },
        {
          cid,
          path: JSON.stringify(metadataFilePath)
        }
      ]);
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    res.status(500).send();
    console.log(err);
  }
});

app.get('/get-from-ipfs', async (req, res) => {
  try {
    if (!req.query.cid) return res.status(422).send("Missing 'cid' query parameter");
    const nft = await Nft.find({ cid: req.query.cid }).lean();
    if (nft.length) {
      const imageFilePath = nft.filter(i => JSON.parse(i.path).pop().split('.').pop() !== 'json')[0].path;
      const jsonFilePath = nft.filter(i => JSON.parse(i.path).pop().split('.').pop() === 'json')[0].path;
      try {
        const data = await readFile(JSON.parse(jsonFilePath).join('/'));
        const metadata = JSON.parse(data);
        res.send({
          ...metadata,
          cid: nft[0].cid,
          path: JSON.parse(imageFilePath),
          isIPFS: false,
          url: `${apiProtocol}://${apiBaseURL}/${JSON.parse(imageFilePath).join('/')}`
        });
        return await Metadata.findOneAndUpdate({ cid: req.query.cid }, { $set: { cid: req.query.cid, ...metadata } }, { upsert: true });
      } catch (err) {
        console.log(err);
      }
    }

    const response = await fetch(`https://${req.query.cid}.ipfs.w3s.link`);
    const metadata = await response.json();
    res.json({ isIPFS: true, ...metadata, ...(metadata.image ? { url: metadata.image } : {}) });
    return await Metadata.findOneAndUpdate({ cid: req.query.cid }, { $set: { cid: req.query.cid, ...metadata } }, { upsert: true });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

app.use(userRouter);
app.use(eventRouter);
app.use(nftStatusRouter);
app.use(nftRouter);
app.use(priceRouter);
app.use(offerRouter);

['/assets', '/assets/images', '/assets/nfts'].forEach(dir => {
  if (!fs.existsSync(`${dirname}${dir}`)) {
    fs.mkdirSync(`${dirname}${dir}`);
  }
});

app.use('/assets', express.static(path.join(dirname, '/assets')));

(async () => {
  await mongoose.connect(process.env.MONGO_URI, {});
  if (process.env.NODE_ENV !== 'production') await Promise.all([await Event.deleteMany({}), await NftStatus.deleteMany({})]);

  setInterval(async () => {
    try {
      if (process.env.NODE_ENV === 'production') {
        const chainIds = Object.keys(CONTRACTS).filter(chainId => chainId !== NETWORK_IDS.LOCALHOST);
        await Promise.all(chainIds.map(chainId => fetchMarketplaceEvents(chainId)));
      } else await fetchMarketplaceEvents(NETWORK_IDS.LOCALHOST);
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
