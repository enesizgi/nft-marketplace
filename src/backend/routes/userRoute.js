import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

router.get('/user/slug', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT u.walletId, u.slug FROM user u WHERE u.walletId = ?', [req.query.id]);
    if (rows.length) {
      res.send(rows[0]);
    } else {
      res.status(404).send('User not found.');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get('/user/id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT u.slug, u.walletId FROM user u WHERE u.slug = ?', [req.query.slug]);
    if (rows.length) {
      res.send(rows[0]);
    } else {
      res.status(404).send('User slug not found.');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get('/user/profile-photo', async (req, res) => {
  const { id } = req.query;
  // TODO :: Fetch user profile photo from DB using id. Return image URL, if exists, else, return a default image.
  res.send({ id, url: 'https://i.etsystatic.com/5805234/r/il/1a38f2/825515703/il_570xN.825515703_19nf.jpg' });
});

router.get('/user/cover-photo', async (req, res) => {
  const { id } = req.query;
  // TODO :: Fetch user cover photo from DB using id. Return image URL, if exists, else, return a default image.
  res.send({ id, url: 'https://media.glassdoor.com/l/1d/0c/e0/81/the-office.jpg' });
});

router.get('/user/name', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT u.walletId, u.name FROM user u WHERE u.walletId = ?', [req.query.id]);
    if (rows.length) {
      res.send(rows[0]);
    } else {
      res.status(404).send('User not found.');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

export default router;
