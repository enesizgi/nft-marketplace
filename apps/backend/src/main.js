import express from 'express';
import compression from 'compression';
import multer from 'multer';
import cors from 'cors';
import { Web3Storage, getFilesFromPath } from 'web3.storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { readFileSync } from 'fs';
import { writeFile, readFile } from 'fs/promises';
import * as dotenv from 'dotenv';
import https from 'https';
import * as mongoose from 'mongoose';
import Nft from './models/nft';
import userRouter from './routes/userRoute';
import { apiBaseURL, apiProtocol } from './constants';
import { fetchMarketplaceEvents } from './utils/index';

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
    const nft = req.query.cid ? await Nft.find({ cid: req.query.cid }).lean() : [];
    if (nft.length) {
      const imageFilePath = nft.filter(i => JSON.parse(i.path).pop().split('.').pop() !== 'json')[0].path;
      const jsonFilePath = nft.filter(i => JSON.parse(i.path).pop().split('.').pop() === 'json')[0].path;
      const data = await readFile(JSON.parse(jsonFilePath).join('/'));
      const metadata = JSON.parse(data);
      return res.send({
        ...metadata,
        cid: nft[0].cid,
        path: JSON.parse(imageFilePath),
        isIPFS: false,
        url: `${apiProtocol}://${apiBaseURL}/${JSON.parse(imageFilePath).join('/')}`
      });
    }

    const response = await client.get(req.query.cid);
    const files = await response.files();
    return res.json({ isIPFS: true, files });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

app.use(userRouter);

app.use('/assets/images', express.static(path.join(dirname, '/assets/images')));
app.use('/assets/nfts', express.static(path.join(dirname, '/assets/nfts')));

(async () => {
  await mongoose.connect(process.env.MONGO_URI, {});
  if (process.env.NODE_ENV === 'production') {
    setInterval(async () => {
      await fetchMarketplaceEvents();
    }, 3000);
  }
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
