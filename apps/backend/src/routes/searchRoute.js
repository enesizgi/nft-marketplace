import express from 'express';
import User from '../models/user';
import Metadata from '../models/metadata';

const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    if (!req.query.searchTerm) return res.status(400).json('Missing searchTerm');
    const { searchTerm } = req.query;
    const createSearchAggregation = path => [
      {
        $search: {
          text: {
            query: searchTerm,
            path,
            fuzzy: {}
          }
        }
      },
      ...(req.query.skip ? [{ $skip: parseInt(req.query.skip, 10) }] : []),
      ...(req.query.limit ? [{ $limit: parseInt(req.query.limit, 10) }] : [])
    ];
    const userSearchAggregation = createSearchAggregation(['slug', 'name']);
    const users = await User.aggregate(userSearchAggregation);
    const nftSearchAggregation = createSearchAggregation(['description', 'name']);
    const nfts = await Metadata.aggregate(nftSearchAggregation);
    return res.status(200).json({ users, nfts });
  } catch (err) {
    console.log(err);
    return res.status(500).json(null);
  }
});

export default router;
