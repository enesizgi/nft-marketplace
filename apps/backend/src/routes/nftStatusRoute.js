import express from 'express';
import NftStatus from '../models/nft_status';

const router = express.Router();

router.get('/nftStatus', async (req, res) => {
  try {
    const filters = {
      ...(req.query.network && { network: req.query.network }),
      ...(req.query.type && { type: req.query.type }),
      ...(req.query.seller && { seller: req.query.seller }),
      ...(req.query.nft && { nft: req.query.nft }),
      ...(req.query.marketplaceContract && { marketplaceContract: req.query.marketplaceContract }),
      ...(req.query.sold && { sold: req.query.sold }),
      ...(req.query.canceled && { canceled: req.query.canceled }),
      ...(req.query.timeToEnd && { timeToEnd: { $gte: parseInt(req.query.timeToEnd, 10) } }),
      ...(req.query.tokenId && { tokenId: req.query.tokenId })
    };
    const nfts = await NftStatus.find(filters)
      .skip(req.query.skip || 0)
      .limit(req.query.limit || 0)
      .lean();
    return res.send(nfts || []);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/nftStatus/count', async (req, res) => {
  try {
    const filters = {
      ...(req.query.network && { network: req.query.network }),
      ...(req.query.type && { type: req.query.type }),
      ...(req.query.seller && { seller: req.query.seller }),
      ...(req.query.nft && { nft: req.query.nft }),
      ...(req.query.marketplaceContract && { marketplaceContract: req.query.marketplaceContract }),
      ...(req.query.sold && { sold: req.query.sold }),
      ...(req.query.canceled && { canceled: req.query.canceled }),
      ...(req.query.timeToEnd && { timeToEnd: { $gte: parseInt(req.query.timeToEnd, 10) } })
    };
    const count = await NftStatus.find(filters).count().lean();
    return res.send({ count: count || 0 });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

export default router;
