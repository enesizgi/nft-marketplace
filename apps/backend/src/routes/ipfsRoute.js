import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Web3Storage, getFilesFromPath } from 'web3.storage';
import path from 'path';
import Metadata from '../models/metadata';
import { apiBaseURL, apiProtocol } from '../constants';
import Nft from '../models/nft';

const router = express.Router();
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
const dirname = path.resolve();

router.post('/ipfs/upload', upload.array('files'), async (req, res) => {
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

router.get('/ipfs', async (req, res) => {
  try {
    console.log(req.query.cid);
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

export default router;
