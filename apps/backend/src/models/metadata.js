import * as mongoose from 'mongoose';

const MetadataSchema = new mongoose.Schema(
  {
    cid: String,
    name: String,
    description: String,
    image: String
  },
  {
    typeKey: '$type',
    timestamps: { createdAt: 'doc_created_at', updatedAt: 'doc_updated_at' }
  }
);

export default mongoose.model('Metadata', MetadataSchema, 'metadata');
