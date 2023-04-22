import * as mongoose from 'mongoose';

const RandomNftSchema = new mongoose.Schema(
  {
    uri: String,
    contract: String,
    tokenCount: Number
  },
  {
    typeKey: '$type',
    timestamps: { createdAt: 'doc_created_at', updatedAt: 'doc_updated_at' }
  }
);

RandomNftSchema.index({ uri: 1 }, { unique: true });

export default mongoose.model('RandomNft', RandomNftSchema, 'random_nfts');
