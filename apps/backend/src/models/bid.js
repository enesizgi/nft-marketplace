import * as mongoose from 'mongoose';

const BidSchema = new mongoose.Schema(
  {
    bidder: String,
    amount: Number,
    tokenId: Number,
    deadline: Number,
    v: String,
    r: String,
    s: String
  },
  {
    typeKey: '$type',
    timestamps: { createdAt: 'doc_created_at', updatedAt: 'doc_updated_at' }
  }
);
export default mongoose.model('Bid', BidSchema, 'bids');
