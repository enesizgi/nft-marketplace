import * as mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema(
  {
    user_id: String,
    image_path: String,
    type: String
  },
  {
    typeKey: '$type',
    timestamps: { createdAt: 'doc_created_at', updatedAt: 'doc_updated_at' }
  }
);

export default mongoose.model('Image', ImageSchema, 'images');
