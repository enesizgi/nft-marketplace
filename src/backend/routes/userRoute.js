import express from 'express';
import multer from 'multer';
import { ethers } from 'ethers';
import fs from 'fs';
import pool from '../config/db.js';

const router = express.Router();

const imageType = {
  ProfilePhoto: 'profile_photo',
  CoverPhoto: 'cover_photo'
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'assets/images');
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/\s/g, '')}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|avif)$/)) {
    req.fileValidationError = 'Invalid mimetype';
    return cb(null, false, new Error('Invalid mimetype'));
  }
  return cb(null, true);
};

const verifyMessage = async (req, res, next) => {
  try {
    if (!req.query.message || !req.query.signature) {
      return res.status(400).send('Missing message or signature');
    }
    const recoveredAddress = await ethers.utils.verifyMessage(req.query.message, req.query.signature);
    if (recoveredAddress.toLowerCase() !== req.query.address.toLowerCase()) {
      return res.status(401).send('Message could not verified');
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
  return next();
};

const userValidator = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT u.walletId FROM user u WHERE u.walletId = ?', [req.query.id]);
    if (!rows.length) {
      return res.status(404).send('User not found');
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
  return next();
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter
});

router.get('/user/check', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT u.walletId as id FROM user u WHERE u.walletId = ?', [req.query.id]);
    if (rows.length) {
      res.send(rows[0]);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.post('/user/create', verifyMessage, async (req, res) => {
  try {
    await pool.query('INSERT INTO user VALUES (?,?,?,?)', [null, req.query.address, null, 'Unnamed']);
    return res.status(201).send('User saved successfully');
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/user/slug', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT u.walletId as id, u.slug as slug FROM user u WHERE u.walletId = ?', [req.query.id]);
    if (rows.length) {
      res.send(rows[0]);
    } else {
      // default response for the demo: will be changed
      res.status(404).send({ id: req.query.id, slug: 'test' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get('/user/id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT u.slug as slug, u.walletId as id FROM user u WHERE u.slug = ?', [req.query.slug]);
    if (rows.length) {
      res.send(rows[0]);
    } else {
      // default response for the demo: will be changed
      res.status(404).send({ slug: req.query.slug, id: '0xabc' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

async function uploadPhoto(id, url, type) {
  const absolutePath = `http://localhost:3001/${url}`;
  const [rows] = await pool.query('SELECT i.image_path as path FROM image i WHERE i.user_id = ? AND i.type = ?', [id, type]);
  if (rows.length) {
    await pool.query('UPDATE image i SET image_path = ? WHERE i.user_id = ? AND i.type = ?', [url, id, type]);
    // DELETE OLD FILE
    fs.unlink(rows[0].path, error => {
      if (error) console.log('Error occured while deleting file ', error);
    });
    return absolutePath;
  }
  await pool.query('INSERT INTO image VALUES (?,?,?,?)', [null, id, url, type]);
  return absolutePath;
}

// TODO: Set up user controller and reuse code for profile and cover upload
router.post('/user/upload-profile-photo', userValidator, verifyMessage, upload.single('profile-photo'), async (req, res) => {
  if (req.fileValidationError) {
    return res.status(412).end(req.fileValidationError);
  }
  if (!req.file) {
    return res.status(412).send('No file received');
  }

  try {
    const relativePath = req.file.path.replace(/\.\.\//g, '');
    const absolutePath = await uploadPhoto(req.query.id, relativePath, imageType.ProfilePhoto);
    return res.status(201).send({ url: absolutePath });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post('/user/upload-cover-photo', userValidator, verifyMessage, upload.single('cover-photo'), async (req, res) => {
  if (req.fileValidationError) {
    return res.status(412).end(req.fileValidationError);
  }
  if (!req.file) {
    return res.status(412).send('No file received');
  }

  try {
    const relativePath = req.file.path.replace(/\.\.\//g, '');
    const absolutePath = await uploadPhoto(req.query.id, relativePath, imageType.CoverPhoto);
    return res.status(201).send({ url: absolutePath });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/user/profile-photo', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT i.user_id as id, i.image_path as url FROM image i WHERE i.user_id = ? AND i.type = ?', [
      req.query.id,
      imageType.ProfilePhoto
    ]);
    if (rows.length) {
      res.send({ ...rows[0], url: `http://localhost:3001/${rows[0].url}` });
    } else {
      // TODO: Return default avatar
      res.status(404).send({ id: req.query.id, url: 'https://i.etsystatic.com/5805234/r/il/1a38f2/825515703/il_570xN.825515703_19nf.jpg' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get('/user/cover-photo', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT i.user_id as id, i.image_path as url FROM image i WHERE i.user_id = ? AND i.type = ?', [
      req.query.id,
      imageType.CoverPhoto
    ]);
    if (rows.length) {
      res.send({ ...rows[0], url: `http://localhost:3001/${rows[0].url}` });
    } else {
      // TODO: Return default cover
      res.status(404).send({ id: req.query.id, url: 'https://media.glassdoor.com/l/1d/0c/e0/81/the-office.jpg' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

router.get('/user/name', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT u.walletId as id, u.name as name FROM user u WHERE u.walletId = ?', [req.query.id]);
    if (rows.length) {
      res.send(rows[0]);
    } else {
      // default response for the demo: will be changed
      res.status(404).send({ id: req.query.id, name: 'Micheal Scott' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});

export default router;
