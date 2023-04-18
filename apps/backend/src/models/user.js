import * as mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    walletId: String,
    slug: String,
    name: String,
    cart: [Number],
    favorites: [Number]
  },
  {
    typeKey: '$type',
    timestamps: { createdAt: 'doc_created_at', updatedAt: 'doc_updated_at' }
  }
);

UserSchema.index({ walletId: 1 }, { unique: true });
UserSchema.index({ slug: 'text' }, { unique: true });

export default mongoose.model('User', UserSchema, 'users');
