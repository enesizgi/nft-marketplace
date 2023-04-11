import express from 'express';
import Nft from '../models/nft';
import { verifyMessage } from '../utils';
import { apiBaseURL, apiProtocol } from '../constants';

const router = express.Router();
// Currently we are not using nftRoute file, but if we decide to use it, we need to migrate this to MongoDB.

//  list all nft's in DB
router.get('/nft', async (req, res) => {
  try {
    const nft = req.query.id ? await Nft.find({ cid: req.query.id }).limit(1).lean() : [];

    if (nft.length) {
      const pathList = JSON.parse(nft[0].path) || [];
      const realPath = pathList.join('/');
      return res.send({ ...nft[0], path: `${apiProtocol}://${apiBaseURL}/${realPath}` });
    }
    // default response for the demo: will be changed
    return res.status(404).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post('/nft/create', verifyMessage, async (req, res) => {
  try {
    // await pool.query('INSERT INTO nft VALUES (?,?,?)', [req.query.cid, req.query.path, req.query.id]);
    return res.status(201).send({ status: 'Nft saved successfully', id: req.query.cid });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/nft/cid', async (req, res) => {
  try {
    const rows = [];
    // const [rows] = await pool.query('SELECT* FROM nft WHERE cid = ?', [req.query.id]);
    if (rows.length) {
      res.send(rows[0]);
    } else {
      res.status(404).send('NFT not found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

// Get all the NFT's belongs to user by given user wallet_id
router.get('/nft/user', async (req, res) => {
  try {
    const rows = [];
    // const [rows] = await pool.query('SELECT n.cid as cid, n.path as path FROM user u JOIN nft n on u.walletId = n.user_id WHERE u.walletId = ?', [
    //   req.query.id
    // ]);
    if (rows.length) {
      res.send(rows[0]);
    } else {
      res.status(404).send('NFT not found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get('/nft/user-info', async (req, res) => {
  try {
    const rows = [];
    // const [rows] = await pool.query(
    //   'SELECT u.walletId as id, u.slug as slug, u.name as name FROM user u JOIN nft n on u.walletId = n.user_id WHERE n.cid= ?',
    //   [req.query.id]
    // );
    if (rows.length) {
      res.send(rows[0]);
    } else {
      res.status(404).send('NFT not found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.post('/nft/delete', verifyMessage, async (req, res) => {
  try {
    // await pool.query('DELETE FROM nft WHERE cid = ?', [req.query.id]);
    return res.status(201).send({ status: 'Nft deleted successfully', id: req.query.cid });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post('/nft/update', verifyMessage, async (req, res) => {
  try {
    // await pool.query('UPDATE nft SET cid = ?, path = ? WHERE cid = ?', [req.query.cid, req.query.path, req.body.cid]);
    return res.status(201).send({ status: "Nft's cid and path updated successfully", id: req.query.cid });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

export default router;
