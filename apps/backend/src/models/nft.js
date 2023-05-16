import * as mongoose from 'mongoose';

const NftSchema = new mongoose.Schema(
  {
    cid: String,
    imagePath: Array,
    metadataPath: Array,
    tokenId: Number,
    nftContract: String,
    network: String
  },
  {
    typeKey: '$type',
    timestamps: { createdAt: 'doc_created_at', updatedAt: 'doc_updated_at' }
  }
);

NftSchema.index({ cid: 1 }, { unique: true });

export default mongoose.model('Nft', NftSchema, 'nfts');
