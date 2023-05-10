import express from 'express';
import Bid from '../models/bid';

const router = express.Router();

router.get('/bids', async (req, res) => {
  try {
    const { tokenId } = req.query;
    if (!tokenId) {
      return res.status(404).send();
    }
    const offers = await Bid.find({ tokenId }).lean();
    return res.send(offers || []);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});
router.post('/bids/create', async (req, res) => {
  try {
    await Bid.create({
      bidder: req.query.bidder,
      amount: req.query.amount,
      tokenId: req.query.tokenId,
      deadline: req.query.deadline,
      v: req.query.v,
      r: req.query.r,
      s: req.query.s
    });
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
