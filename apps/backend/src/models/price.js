import * as mongoose from 'mongoose';

const PriceSchema = new mongoose.Schema(
  {
    coin: String,
    symbol: String,
    price: Number,
    currency: String
  },
  {
    typeKey: '$type',
    timestamps: { createdAt: 'doc_created_at', updatedAt: 'doc_updated_at' }
  }
);

const Price = mongoose.model('Price', PriceSchema, 'prices');

export default Price;
