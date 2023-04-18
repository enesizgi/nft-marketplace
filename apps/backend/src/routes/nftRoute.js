import express from 'express';
import Nft from '../models/nft';
import { apiBaseURL, apiProtocol } from '../constants';
import Metadata from '../models/metadata';

const router = express.Router();

router.get('/nft', async (req, res) => {
  if (!req.query.cid && !req.query.tokenId) {
    return res.status(400).send();
  }
  try {
    const nfts = await Nft.find({
      ...(req.query.cid && { cid: Number(req.query.cid) }),
      ...(req.query.tokenId && { tokenId: Number(req.query.tokenId) })
    })
      .limit(1)
      .lean();

    if (nfts.length === 0) {
      return res.status(404).send();
    }

    const { cid } = nfts[0];
    const metadata = await Metadata.find({ cid }).limit(1).lean();

    if (metadata.length === 0) {
      return res.status(404).send();
    }

    const pathList = JSON.parse(nfts[0].path) || [];
    const realPath = pathList.join('/');
    return res.send({ ...nfts[0], path: `${apiProtocol}://${apiBaseURL}/${realPath}`, metadata: metadata[0] });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/nft/multiple');

router.post('/nft/tokenId', async (req, res) => {
  const { cid } = req.query;
  const { tokenId } = req.body;

  if (!tokenId || !cid) {
    return res.status(400).send();
  }

  try {
    await Nft.updateMany({ cid }, { tokenId });
    return res.status(200).send({ cid, tokenId });
  } catch (e) {
    console.log(e);
    return res.status(500).send();
  }
});

export default router;
