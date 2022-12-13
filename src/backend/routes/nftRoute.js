import express from 'express';
import { ethers } from 'ethers';
import pool from '../config/db.js';

const router = express.Router();
//  list all nft's in DB
router.get('/nft', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM nft', [req.query.id]);
    if (rows.length) {
      res.send(rows[0]);
    } else {
      // default response for the demo: will be changed
      res.status(404).send();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

const verifyMessage = async (req, res, next) => {
  try {
    if (!req.query.message || !req.query.signature) {
      return res.status(400).send('Missing message or signature');
    }
    const recoveredAddress = await ethers.utils.verifyMessage(req.query.message, req.query.signature);
    if (recoveredAddress.toLowerCase() !== req.query.id.toLowerCase()) {
      return res.status(401).send('Message could not verified');
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
  return next();
};

router.post('/nft/create', verifyMessage, async (req, res) => {
  try {
    await pool.query('INSERT INTO nft VALUES (?,?,?)', [req.query.cid, req.query.path, req.query.id]);
    return res.status(201).send({ status: 'Nft saved successfully', id: req.query.cid });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/nft/cid', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT* FROM nft WHERE cid = ?', [req.query.id]);
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
    const [rows] = await pool.query('SELECT n.cid as cid, n.path as path FROM user u JOIN nft n on u.walletId = n.user_id WHERE u.walletId = ?', [
      req.query.id
    ]);
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
    const [rows] = await pool.query(
      'SELECT u.walletId as id, u.slug as slug, u.name as name FROM user u JOIN nft n on u.walletId = n.user_id WHERE n.cid= ?',
      [req.query.id]
    );
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
    await pool.query('DELETE FROM nft WHERE cid = ?', [req.query.id]);
    return res.status(201).send({ status: 'Nft deleted successfully', id: req.query.cid });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post('/nft/update', verifyMessage, async (req, res) => {
  try {
    await pool.query('UPDATE nft SET cid = ?, path = ? WHERE cid = ?', [req.query.cid, req.query.path, req.body.cid]);
    return res.status(201).send({ status: "Nft's cid and path updated successfully", id: req.query.cid });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

export default router;
