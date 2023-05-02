import express from 'express';
import User from '../models/user';
import Metadata from '../models/metadata';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    if (!req.query.searchTerm) return res.status(400).json('Missing searchTerm');
    const { searchTerm } = req.query;
    const users = await User.aggregate([
      {
        $search: {
          text: {
            query: searchTerm,
            path: ['slug', 'name'],
            fuzzy: {}
          }
        }
      },
      ...(req.query.skip ? [{ $skip: parseInt(req.query.skip, 10) }] : []),
      ...(req.query.limit ? [{ $limit: parseInt(req.query.limit, 10) }] : [])
    ]);
    const nfts = await Metadata.aggregate([
      {
        $search: {
          text: {
            query: searchTerm,
            path: ['description', 'name'],
            fuzzy: {}
          }
        }
      },
      {
        $lookup: {
          from: 'nfts',
          localField: 'cid',
          foreignField: 'cid',
          as: 'tokenId'
        }
      },
      {
        $set: {
          tokenId: {
            $arrayElemAt: ['$tokenId', 0]
          }
        }
      },
      {
        $set: {
          tokenId: '$tokenId.tokenId'
        }
      },
      {
        $match: {
          tokenId: {
            $exists: true
          }
        }
      },
      ...(req.query.skip ? [{ $skip: parseInt(req.query.skip, 10) }] : []),
      ...(req.query.limit ? [{ $limit: parseInt(req.query.limit, 10) }] : [])
    ]);
    return res.status(200).json({ users, nfts });
  } catch (err) {
    console.log(err);
    return res.status(500).json(null);
  }
});

export default router;
