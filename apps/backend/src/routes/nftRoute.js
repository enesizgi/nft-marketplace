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
    const tokenIds = JSON.parse(req.query.tokenId);

    if (tokenIds.length === 0 || !req.query.nftContract || !req.query.network) return res.status(400).send();
    const nfts = await Nft.find({
      ...(req.query.cid && { cid: Number(req.query.cid) }),
      ...(req.query.tokenId && { tokenId: { $in: tokenIds } }),
      nftContract: req.query.nftContract,
      network: req.query.network,
      path: { $not: /json/i }
    }).lean();

    if (nfts.length === 0) return res.status(404).send();

    const metadata = await Metadata.find({ cid: { $in: nfts.map(n => n.cid) } }).lean();

    if (metadata.length === 0) return res.status(404).send();

    return res.json(
      nfts.map(nft => {
        const pathList = JSON.parse(nft.path) || [];
        const realPath = pathList.join('/');
        return { ...nft, path: `${apiProtocol}://${apiBaseURL}/${realPath}`, metadata: metadata.find(m => m.cid === nft.cid) };
      })
    );
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/nft/multiple');

router.post('/nft/tokenId', async (req, res) => {
  const { cid } = req.query;
  const { tokenId, nftContract, network } = req.body;

  if (!tokenId || !cid || !nftContract || !network) {
    return res.status(400).send();
  }

  try {
    await Nft.updateMany({ cid }, { tokenId, nftContract, network });
    return res.status(200).send({ cid, tokenId, nftContract, network });
  } catch (e) {
    console.log(e);
    return res.status(500).send();
  }
});

export default router;
