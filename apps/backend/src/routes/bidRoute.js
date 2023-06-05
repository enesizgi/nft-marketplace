import express from 'express';
import Bid from '../models/bid';

const router = express.Router();

router.get('/bids', async (req, res) => {
  try {
    const { tokenId } = req.query;
    if (!tokenId) {
      return res.status(404).send();
    }
    const offers = await Bid.find({ tokenId }).sort({ doc_updated_at: -1 }).lean();
    return res.send(offers || []);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});
router.post('/bids/create', async (req, res) => {
  try {
    await Bid.findOneAndUpdate(
      {
        bidder: req.query.bidder,
        tokenId: req.query.tokenId
        // network: req.query.network,
        // chainId: req.query.chainId,
        // nftContractAddress: req.query.nftContractAddress,
      },
      {
        amount: req.query.amount,
        deadline: req.query.deadline,
        v: req.query.v,
        r: req.query.r,
        s: req.query.s
      },
      {
        upsert: true
      }
    );
    return res.status(201).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post('/bids/delete', async (req, res) => {
  try {
    await Bid.deleteOne({
      bidder: req.query.bidder,
      tokenId: req.query.tokenId,
      deadline: req.query.deadline
    });
    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post('/bids/deleteNft', async (req, res) => {
  try {
    await Bid.deleteMany({
      tokenId: req.query.tokenId
    });
    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

export default router;
