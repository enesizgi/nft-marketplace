import express from 'express';
import Nft from '../models/nft';
import { apiBaseURL, apiProtocol } from '../constants';
import Metadata from '../models/metadata';
import RandomNft from '../models/randomNft';

const router = express.Router();

router.get('/nft', async (req, res) => {
  try {
    if (!req.query.cid && !req.query.tokenId) {
      return res.status(400).send();
    }
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

router.post('/nft/tokenId', async (req, res) => {
  try {
    const { cid } = req.query;
    const { tokenId, nftContract, network } = req.body;

    if (!tokenId || !cid || !nftContract || !network) {
      return res.status(400).send();
    }
    await Nft.updateMany({ cid }, { tokenId, nftContract, network });
    return res.status(200).send({ cid, tokenId, nftContract, network });
  } catch (e) {
    console.log(e);
    return res.status(500).send();
  }
});

router.get('/nft/random', async (req, res) => {
  try {
    const [nft] = await RandomNft.aggregate([{ $sample: { size: 1 } }]);
    if (!nft.uri.includes('{tokenId}')) {
      return res.status(500).json('Try again later.');
    }
    const randomTokenId = Math.floor(Math.random() * nft.tokenCount);
    const metadata = await fetch(nft.uri.replace('{tokenId}', randomTokenId.toString()));
    const metadataJson = await metadata.json();

    if (metadataJson.image.startsWith('https://') && metadataJson.image.includes('/ipfs/')) {
      metadataJson.image = `https://dweb.link/ipfs/${metadataJson.image.split('/ipfs/')[1]}`;
      return res.json(metadataJson);
    }

    if (!metadataJson.image.startsWith('ipfs://')) {
      return res.status(500).json('Try again later.');
    }

    const imageUri = metadataJson.image.replace('ipfs://', '');
    const imageCid = imageUri.split('/')[0];
    const imageRest = imageUri.replace(imageCid, '');
    metadataJson.image = `https://dweb.link/ipfs/${imageCid}`;
    if (imageRest) metadataJson.image += imageRest;

    return res.json(metadataJson);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

export default router;
