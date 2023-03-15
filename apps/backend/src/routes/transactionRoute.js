import express from 'express';
import { verifyMessage } from '../utils';

const router = express.Router();

router.get('/transactions/cached', async (req, res) => {
  try {
    const rows = [];
    // const [rows] = await pool.query('SELECT *  FROM transaction t WHERE t.contract_id = ?', [req.query.id]);
    if (rows.length) {
      res.send(rows[0]);
    } else {
      res.status(404).send('Transaction not found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.post('/transactions/create', verifyMessage, async (req, res) => {
  try {
    // await pool.query('INSERT INTO transaction VALUES (?,?,?,?,?,?)', [
    //   req.query.price,
    //   req.query.event,
    //   req.query.sender,
    //   req.query.owner,
    //   req.query.contractId,
    //   req.query.block
    // ]);
    return res.status(201).send({ status: 'User saved successfully', id: req.query.id });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post('/transactions/contract-id/update', verifyMessage, async (req, res) => {
  try {
    // await pool.query('UPDATE transaction SET transaction.contract_id = ? WHERE transaction.contract_id = ?', [
    //   req.query.conractIdUpdated,
    //   req.query.contractId
    // ]);
    return res.status(201).send({ status: 'User saved successfully', id: req.query.id });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post('/transactions/block-number/update', verifyMessage, async (req, res) => {
  try {
    // await pool.query('UPDATE transaction SET transaction.block_number = ? WHERE transaction.block_number = ?', [
    //   req.query.blockNumberUpdated,
    //   req.query.blockNumber
    // ]);
    return res.status(201).send({ status: 'User saved successfully', id: req.query.id });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/transactions/owner-user', async (req, res) => {
  try {
    const rows = [];
    // const [rows] = await pool.query(
    //   'SELECT u.name AS name, u.walletId AS user_id, u.slug AS slug, t.contract_id AS contract_id, t.price AS price \n' +
    //     'FROM transaction t\n' +
    //     'LEFT JOIN user u on t.owner = u.walletId\n' +
    //     'WHERE u.walletId = ?;',
    //   [req.query.id]
    // );
    if (rows.length) {
      res.send(rows[0]);
    } else {
      res.status(404).send('Transaction not found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get('/transactions/seller-user', async (req, res) => {
  try {
    const rows = [];
    // const [rows] = await pool.query(
    //   'SELECT u.name AS name, u.walletId AS user_id, u.slug AS slug, t.contract_id AS contract_id, t.price AS price \n' +
    //     'FROM transaction t \n' +
    //     'LEFT JOIN user u on t.sender = u.walletId \n' +
    //     'WHERE u.walletId = ?;',
    //   [req.query.id]
    // );
    if (rows.length) {
      res.send(rows[0]);
    } else {
      res.status(404).send('Transaction not found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

export default router;
