import express from 'express';
import Nft from '../models/nft';
import { apiBaseURL, apiProtocol } from '../constants';

const router = express.Router();

router.get('/nft', async (req, res) => {
  try {
    const nft = req.query.id ? await Nft.find({ cid: req.query.id }).limit(1).lean() : [];

    if (nft.length) {
      const pathList = JSON.parse(nft[0].path) || [];
      const realPath = pathList.join('/');
      return res.send({ ...nft[0], path: `${apiProtocol}://${apiBaseURL}/${realPath}` });
    }
    return res.status(404).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

export default router;
