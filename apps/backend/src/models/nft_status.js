import * as mongoose from 'mongoose';

const NftStatusSchema = new mongoose.Schema(
  {
    type: String,
    itemId: Number,
    nft: String,
    marketplaceContract: String,
    price: String,
    tokenId: Number,
    seller: String,
    buyer: String,
    claimed: Boolean,
    canceled: Boolean,
    sold: Boolean,
    timeToEnd: Date
  },
  {
    typeKey: '$type',
    timestamps: { createdAt: 'doc_created_at', updatedAt: 'doc_updated_at' },
    strict: false
  }
);

export default mongoose.model('NftStatus', NftStatusSchema, 'nft_status');
