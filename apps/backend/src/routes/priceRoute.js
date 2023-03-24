import express from 'express';
import Price from '../models/price';

const router = express.Router();

router.get('/price/ethereum/usd', async (req, res) => {
  try {
    const price = await Price.findOne({ coin: 'Ethereum', symbol: 'ETH', currency: 'USD' }).lean();
    return res.send(price || {});
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

export default router;
