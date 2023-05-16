import express from 'express';
import Nft from '../models/nft';
import NftStatus from '../models/nft_status';
import { apiBaseURL, apiProtocol } from '../constants';
import Metadata from '../models/metadata';
import RandomNft from '../models/randomNft';
import { etherscanLimiter, getMarketplaceContract, getNftContract } from '../utils';

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
      tokenId: { $in: tokenIds },
      nftContract: req.query.nftContract,
      network: req.query.network
    }).lean();

    const nftContract = getNftContract(req.query.network);

    nfts.push(
      ...(await Promise.all(
        tokenIds
          .map(async tokenId => {
            if (nfts.find(nft => nft.tokenId === tokenId)) return null;
            try {
              await etherscanLimiter.wait({ chainId: req.query.network });
              const tokenURI = await nftContract.tokenURI(tokenId);
              if (tokenURI.startsWith('ipfs://')) {
                const cid = tokenURI.split('//')[1];
                const response = await fetch(`https://${cid}.ipfs.w3s.link`);
                const metadata = await response.json();
                return {
                  cid,
                  tokenId,
                  nftContract: req.query.nftContract,
                  network: req.query.network,
                  isIPFS: true,
                  ...metadata,
                  ...(metadata.image ? { url: metadata.image } : {})
                };
              }
            } catch (err) {
              console.log(err);
            }
            return null;
          })
          .filter(i => i)
      ))
    );

    if (nfts.length === 0) return res.status(404).send();

    const metadata = await Metadata.find({ cid: { $in: nfts.map(n => n.cid) } }).lean();

    const marketplaceContract = getMarketplaceContract(req.query.network);

    const nftStatus = await NftStatus.find({
      tokenId: { $in: tokenIds }
    }).lean();

    const storeInfo = await nftStatus.reduce(async (_prev, nft) => {
      const prev = await _prev;
      if (nft.itemId) {
        await etherscanLimiter.wait({ chainId: req.query.network });
        const price = await marketplaceContract.getTotalPrice(nft.itemId);
        prev[nft.tokenId] = { price, itemId: nft.itemId };
        return prev;
      }
      return prev;
    }, {});

    return res.json(
      nfts.map(nft => ({
        ...nft,
        path: nft.image || nft.url || `${apiProtocol}://${apiBaseURL}/${nft.imagePath.join('/')}`,
        metadata: nft.metadata || metadata.find(m => m.cid === nft.cid),
        ...(storeInfo && { ...storeInfo[nft.tokenId] })
      }))
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
