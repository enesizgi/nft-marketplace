import * as mongoose from 'mongoose';
import { SHOPPING_LIST_TYPES } from '../constants';

const ShoppingListSchema = new mongoose.Schema(
  {
    walletId: String,
    chainId: String,
    listType: {
      type: String,
      enum: Object.values(SHOPPING_LIST_TYPES)
    },
    items: [Number]
  },
  {
    typeKey: '$type',
    timestamps: { createdAt: 'doc_created_at', updatedAt: 'doc_updated_at' }
  }
);

ShoppingListSchema.index({ walletId: 1, listType: 1, chainId: 'text' }, { unique: true });

export default mongoose.model('ShoppingList', ShoppingListSchema, 'shopping_list');
