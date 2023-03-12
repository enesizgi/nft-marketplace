import * as mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    walletId: String,
    slug: String,
    name: String
  },
  {
    typeKey: '$type',
    timestamps: { createdAt: 'doc_created_at', updatedAt: 'doc_updated_at' }
  }
);

const User = mongoose.model('User', UserSchema, 'users');

export default User;
