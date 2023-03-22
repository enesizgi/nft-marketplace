import express from 'express';
import Event from '../models/event';

const router = express.Router();

router.get('/events', async (req, res) => {
  try {
    const filters = {
      ...(req.query.network && { network: req.query.network }),
      ...(req.query.type && { type: req.query.type }),
      ...(req.query.seller && { seller: req.query.seller }),
      ...(req.query.nft && { nft: req.query.nft }),
      ...(req.query.marketplaceContract && { marketplaceContract: req.query.marketplaceContract })
    };
    const events = await Event.find(filters).lean();
    return res.send(events || []);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

export default router;
