import * as mongoose from 'mongoose';

const NftSchema = new mongoose.Schema(
  {
    cid: String,
    path: String
  },
  {
    typeKey: '$type',
    timestamps: { createdAt: 'doc_created_at', updatedAt: 'doc_updated_at' }
  }
);

const Nft = mongoose.model('Nft', NftSchema, 'nfts');

export default Nft;
