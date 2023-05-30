import express from 'express';
import Event from '../models/event';
import { fetchMarketplaceEvents } from '../utils';

const router = express.Router();

router.get('/events', async (req, res) => {
  try {
    const filters = {
      ...(req.query.network && { network: req.query.network }),
      ...(req.query.type && { type: req.query.type }),
      ...(req.query.type && { buyer: { $regex: `${req.query.buyer}/i` } }),
      ...(req.query.seller && { seller: { $regex: `${req.query.seller}/i` } }),
      ...(req.query.nft && { nft: req.query.nft }),
      ...(req.query.marketplaceContract && { marketplaceContract: req.query.marketplaceContract }),
      ...(req.query.tokenId && { tokenId: parseInt(req.query.tokenId, 10) }),
      ...(req.query.auctionId && { auctionId: parseInt(req.query.auctionId, 10) })
    };
    const events = await Event.find(filters).lean();
    return res.send(events || []);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/events/sync', async (req, res) => {
  try {
    if (!req.query.chainId) return res.status(400).send('Missing networkId');
    await fetchMarketplaceEvents(req.query.chainId);
    return res.status(200).json('OK!');
  } catch (err) {
    console.log(err);
    return res.status(500).json(null);
  }
});

export default router;
