import express from 'express';
import compression from 'compression';
import multer from 'multer';
import cors from 'cors';
import { Web3Storage, getFilesFromPath } from 'web3.storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { readFileSync, writeFile, readFile } from 'fs';
import * as dotenv from 'dotenv';
import https from 'https';
import pool from '../config/db.js';
import userRouter from '../routes/userRoute.js';
import apiBaseURL from '../constants.js';

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
    writeFile(`${dirname}/assets/nfts/${req.files[0].filename}.json`, req.query.metadata, async err => {
      if (err) {
        res.status(500).send();
        return;
      }
      const metadata = JSON.parse(req.query.metadata);
      const imageFile = await getFilesFromPath([req.files[0].path]);
      const metadataFile = await getFilesFromPath([`${dirname}/assets/nfts/${req.files[0].filename}.json`]);
      const files = [...imageFile, ...metadataFile];
      const cid = await client.put(files);
      res.json({ ...metadata, cid, url: `https://${apiBaseURL}/${req.files[0].path}` });

      const imageFilePath = req.files[0].path.split('/');
      const metadataFilePath = `assets/nfts/${req.files[0].filename}.json`.split('/');
      const insertValues = [
        [cid, JSON.stringify(imageFilePath)],
        [cid, JSON.stringify(metadataFilePath)]
      ];

      await pool.query(`INSERT INTO nft (cid, path) VALUES ?`, [insertValues]);
    });
  } catch (err) {
    res.status(500).send();
    console.log(err);
  }
});

app.get('/get-from-ipfs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT nft.cid as cid, nft.path as path FROM nft WHERE nft.cid = ?', [req.query.cid]);
    if (rows.length) {
      const imageFilePath = rows.filter(i => JSON.parse(i.path).pop().split('.').pop() !== 'json')[0].path;
      const jsonFilePath = rows.filter(i => JSON.parse(i.path).pop().split('.').pop() === 'json')[0].path;
      readFile(JSON.parse(jsonFilePath).join('/'), (err, data) => {
        if (err) throw err;
        const metadata = JSON.parse(data);
        res.send({
          ...metadata,
          cid: rows[0].cid,
          path: JSON.parse(imageFilePath),
          isIPFS: false,
          url: `https://${apiBaseURL}/${JSON.parse(imageFilePath).join('/')}`
        });
      });
      return;
    }

    const response = await client.get(req.query.cid);
    const files = await response.files();
    res.json({ isIPFS: true, files });
  } catch (err) {
    res.status(500).send();
    console.log(err);
  }
});

app.use(userRouter);

app.use('/assets/images', express.static(path.join(dirname, '/assets/images')));
app.use('/assets/nfts', express.static(path.join(dirname, '/assets/nfts')));

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
    .listen(3001, () => {
      console.log('server is running at port 3001');
    });
}
