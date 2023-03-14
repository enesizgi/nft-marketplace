import * as mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    type: Number,
    itemId: Number,
    nft: String,
    price: String,
    tokenId: Number,
    seller: String,
    buyer: String,
    timeToEnd: Date
  },
  {
    typeKey: '$type',
    timestamps: { createdAt: 'doc_created_at', updatedAt: 'doc_updated_at' }
  }
);

const Event = mongoose.model('Event', EventSchema, 'events');

export default Event;
