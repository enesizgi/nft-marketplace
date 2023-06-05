import express from 'express';
import Offer from '../models/offer';

const router = express.Router();

router.get('/offers', async (req, res) => {
  try {
    const { tokenId } = req.query;
    if (!tokenId) {
      return res.status(404).send();
    }
    const offers = await Offer.find({ tokenId }).lean();
    return res.send(offers || []);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});
router.post('/offers/create', async (req, res) => {
  try {
    await Offer.create({
      offerer: req.query.offerer,
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

router.post('/offers/delete', async (req, res) => {
  try {
    await Offer.deleteOne({
      offerer: req.query.offerer,
      tokenId: req.query.tokenId,
      deadline: req.query.deadline
    });
    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post('/offers/deleteAccepted', async (req, res) => {
  try {
    await Offer.deleteMany({
      offerer: req.query.offerer
    });
    return res.status(200).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

export default router;
