import * as mongoose from 'mongoose';

const NftSchema = new mongoose.Schema(
  {
    cid: String,
    path: String,
    tokenId: Number,
    nftContract: String,
    network: String
  },
  {
    typeKey: '$type',
    timestamps: { createdAt: 'doc_created_at', updatedAt: 'doc_updated_at' }
  }
);

NftSchema.index({ cid: 1, path: 1 }, { unique: true });

export default mongoose.model('Nft', NftSchema, 'nfts');
