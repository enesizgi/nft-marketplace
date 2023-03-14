import NftStatus from '../models/nft_status.js';

// eslint-disable-next-line no-unused-vars
const getLastStatusOfNft = async events => {
  const operations = [];
  events.forEach(event => {
    switch (event.type) {
      case 'Offered':
        operations.push({
          insertOne: { type: 'Offered', itemId: event.itemId, nft: event.nft, tokenId: event.tokenId, price: event.price, seller: event.seller }
        });
        break;
      case 'Bought':
        operations.push({
          updateOne: {
            filter: { itemId: event.itemId },
            update: { $set: { type: 'Bought', buyer: event.buyer, sold: true } }
          }
        });
        break;
      case 'AuctionStarted':
        operations.push({
          insertOne: {
            type: 'AuctionStarted',
            auctionId: event.auctionId,
            nft: event.nft,
            tokenId: event.tokenId,
            price: event.price,
            timeToEnd: event.timeToEnd,
            seller: event.seller
          }
        });
        break;
      case 'AuctionEnded':
        operations.push({
          updateOne: {
            filter: { auctionId: event.auctionId },
            update: { $set: { type: 'AuctionEnded', buyer: event.buyer, claimed: true } }
          }
        });
        break;
      default:
        break;
    }
  });
  NftStatus.collection.bulkWrite(operations);
};
