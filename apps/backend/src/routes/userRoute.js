import express from 'express';
import multer from 'multer';
import fs from 'fs';
import User from '../models/user';
import Image from '../models/image';
import Nft from '../models/nft';
import { apiBaseURL, apiProtocol } from '../constants';
import { verifyMessage } from '../utils';

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
  if (!file.originalname.match(/\.(jpg|jpeg|png|avif|webp)$/)) {
    req.fileValidationError = 'Invalid mimetype';
    return cb(null, false, new Error('Invalid mimetype'));
  }
  return cb(null, true);
};

const userValidator = async (req, res, next) => {
  try {
    const user = req.query.id && (await User.findOne({ walletId: req.query.id }).lean());
    if (!user) {
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
// TODO: Merge /user/check and /user/create endpoints. Create user if not exists. And after creating user, return user data.
router.get('/user/check', async (req, res) => {
  try {
    const user = req.query.id && (await User.findOne({ walletId: req.query.id }).lean());
    if (user) {
      const { walletId: id, _id, ...rest } = user;
      return res.send({ id, ...rest });
    }
    return res.status(404).send('User not found');
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post('/user/create', verifyMessage, async (req, res) => {
  try {
    try {
      await User.create({ walletId: req.query.id, slug: null, name: 'Unnamed', cart: [] });
      return res.status(201).send({ status: 'User saved successfully', id: req.query.id });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(201).send({ status: 'User saved successfully', id: req.query.id });
      }
      return res.status(400).send();
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/user', async (req, res) => {
  try {
    let user;
    if (req.query.slug) {
      user = await User.findOne({ slug: req.query.slug }).lean();
    } else {
      // id
      user = await User.findOne({ walletId: req.query.id }).lean();
    }
    const images = user ? await Image.find({ user_id: user.walletId }).lean() : [];
    const imageObj = {};
    images.forEach(row => {
      if (row.type === imageType.ProfilePhoto) {
        imageObj.profilePhoto = `${apiProtocol}://${apiBaseURL}/${row.image_path}`;
      } else if (row.type === imageType.CoverPhoto) {
        imageObj.coverPhoto = `${apiProtocol}://${apiBaseURL}/${row.image_path}`;
      }
    });

    if (user) {
      const { _id, walletId: id, ...rest } = user;
      return res.send({ ...rest, ...imageObj, id });
    }
    return res.status(404).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/user/slug', async (req, res) => {
  try {
    const user = req.query.id && (await User.findOne({ walletId: req.query.id }).lean());
    if (user) {
      return res.status(200).send({ id: user.id, slug: user.slug });
    }
    // default response for the demo: will be changed
    return res.status(404).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/user/id', async (req, res) => {
  try {
    const user = req.query.id && (await User.findOne({ slug: req.query.slug }).lean());
    if (user) {
      const { walletId: id, _id, ...rest } = user;
      return res.send({ id, ...rest });
    }
    // default response for the demo: will be changed
    return res.status(404).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

async function uploadPhoto(req, id, url, type) {
  const absolutePath = `${apiProtocol}://${apiBaseURL}/${url}`;
  const image = id && type && (await Image.findOne({ user_id: id, type }).lean());
  if (image) {
    await Image.updateOne({ user_id: id, type }, { image_path: url });
    // DELETE OLD FILE
    fs.unlink(image.image_path, error => {
      if (error) console.log('Error occured while deleting file ', error);
    });
    return absolutePath;
  }
  await Image.create({ user_id: id, image_path: url, type });
  return absolutePath;
}

router.post(
  '/user/bulkUpdate',
  userValidator,
  upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
  ]),
  async (req, res) => {
    const { coverPhoto: _coverPhoto, profilePhoto: _profilePhoto } = req.files;
    const coverPhoto = _coverPhoto ? _coverPhoto[0] : null;
    const profilePhoto = _profilePhoto ? _profilePhoto[0] : null;
    const { name, slug } = req.query;

    try {
      if (profilePhoto) {
        const profileRelativePath = profilePhoto.path.replace(/\.\.\//g, '');
        await uploadPhoto(req, req.query.id, profileRelativePath, imageType.ProfilePhoto);
      }
      if (coverPhoto) {
        const coverRelativePath = coverPhoto.path.replace(/\.\.\//g, '');
        await uploadPhoto(req, req.query.id, coverRelativePath, imageType.CoverPhoto);
      }
    } catch (err) {
      return res.status(500).send();
    }

    const result = await User.updateOne({ walletId: req.query.id }, { name, slug });
    if (result.acknowledged && result.modifiedCount > 0) {
      const images = await Image.find({ user_id: req.query.id }).lean();

      const profilePhotoPath = images.find(image => image.type === 'profile_photo')?.image_path;
      const absoluteProfilePhotoPath = profilePhotoPath ? `${apiProtocol}://${apiBaseURL}/${profilePhotoPath}` : '';

      const coverPhotoPath = images.find(image => image.type === 'cover_photo')?.image_path;
      const absoluteCoverPhotoPath = coverPhotoPath ? `${apiProtocol}://${apiBaseURL}/${coverPhotoPath}` : '';

      return res.status(200).send({
        id: req.query.id,
        slug,
        name,
        profilePhoto: absoluteProfilePhotoPath,
        coverPhoto: absoluteCoverPhotoPath
      });
    }
    return res.status(500).send();
  }
);

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
    const absolutePath = await uploadPhoto(req, req.query.id, relativePath, imageType.ProfilePhoto);
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
    const absolutePath = await uploadPhoto(req, req.query.id, relativePath, imageType.CoverPhoto);
    return res.status(201).send({ url: absolutePath });
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/user/profile-photo', async (req, res) => {
  try {
    const image = req.query.id && imageType.ProfilePhoto && (await Image.findOne({ user_id: req.query.id, type: imageType.ProfilePhoto }).lean());
    if (image) {
      const { _id, user_id: id, image_path: url, ...rest } = image;
      return res.send({ ...rest, id, url: `${apiProtocol}://${apiBaseURL}/${image.url}` });
    }
    return res.status(404).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/user/cover-photo', async (req, res) => {
  try {
    const image = req.query.id && imageType.ProfilePhoto && (await Image.findOne({ user_id: req.query.id, type: imageType.CoverPhoto }).lean());
    if (image) {
      const { _id, user_id: id, image_path: url, ...rest } = image;
      return res.send({ ...rest, id, url: `${apiProtocol}://${apiBaseURL}/${image.url}` });
    }
    return res.status(404).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/user/name', async (req, res) => {
  try {
    const user = req.query.id && (await User.findOne({ walletId: req.query.id }).lean());
    if (user && Object.keys(user).length) {
      const { _id, walletId: id, ...rest } = user;
      return res.send({ id, ...rest });
    }
    return res.status(404).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/user/cart', userValidator, async (req, res) => {
  try {
    const user = req.query.id && (await User.findOne({ walletId: req.query.id }).lean());
    if (user && Object.keys(user.length)) {
      const { id, cart = [] } = user;
      return res.send({ id, cart });
    }
    return res.status(404).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post('/user/cart', async (req, res) => {
  try {
    const { cart, id } = req.body;
    if (cart.length) {
      const cartItems = cart.map(cid => ({ cid }));
      const foundNfts = await Nft.find({ $or: cartItems }).lean();
      if (foundNfts.length < cartItems.length) {
        // TODO: prevent duplicate cid's in nft table. This condition should've been ===
        return res.status(404).send();
      }
    }
    const result = await User.updateOne({ walletId: id }, { cart });
    if (result.modifiedCount > 0) {
      return res.send({ id, cart });
    }
    return res.status(404).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.get('/user/favorites', userValidator, async (req, res) => {
  try {
    const user = req.query.id && (await User.findOne({ walletId: req.query.id }).lean());
    if (user && Object.keys(user.length)) {
      const { id, favorites = [] } = user;
      return res.send({ id, favorites });
    }
    return res.status(404).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

router.post('/user/favorites', async (req, res) => {
  try {
    const { favorites, id } = req.body;
    if (favorites.length) {
      const favoriteItems = favorites.map(cid => ({ cid }));
      const foundNfts = await Nft.find({ $or: favoriteItems }).lean();
      if (foundNfts.length < favoriteItems.length) {
        // TODO: prevent duplicate cid's in nft table. This condition should've been ===
        return res.status(404).send();
      }
    }
    const result = await User.updateOne({ walletId: id }, { favorites });
    if (result.modifiedCount > 0) {
      return res.send({ id, favorites });
    }
    return res.status(404).send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

export default router;
