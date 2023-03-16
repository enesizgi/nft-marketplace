import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { CONTRACTS } from './constants_new';
import Event from './models/event';
import NftStatus from './models/nft_status';

export const verifyMessage = async (req, res, next) => {
  try {
    if (!req.query.message || !req.query.signature) {
      return res.status(400).send('Missing message or signature');
    }
    const recoveredAddress = await ethers.utils.verifyMessage(req.query.message, req.query.signature);
    const messageCreationDate = new Date(req.query.message.split(' ').pop());
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    if (messageCreationDate < oneDayAgo) {
      return res.status(401).send('Message expired');
    }
    if (recoveredAddress.toLowerCase() !== req.query.id.toLowerCase()) {
      return res.status(401).send('Message could not verified');
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
  return next();
};

export const getLastStatusOfNft = async events => {
  const { insertEvents, updateEvents } = events.reduce(
    (acc, event) => {
      switch (event.type) {
        case 'Offered':
          acc.insertEvents.push({
            type: 'Listing',
            itemId: event.itemId,
            nft: event.nft,
            tokenId: event.tokenId,
            price: event.price,
            seller: event.seller,
            sold: false,
            canceled: false
          });
          return acc;
        case 'Bought':
          acc.updateEvents.push({
            updateOne: {
              filter: { itemId: event.itemId },
              update: { $set: { buyer: event.buyer, sold: true } }
            }
          });
          return acc;
        case 'AuctionStarted':
          acc.insertEvents.push({
            type: 'Auction',
            auctionId: event.auctionId,
            nft: event.nft,
            tokenId: event.tokenId,
            price: event.price,
            timeToEnd: event.timeToEnd,
            seller: event.seller,
            claimed: false,
            canceled: false
          });
          return acc;
        case 'AuctionEnded':
          acc.updateEvents.push({
            updateOne: {
              filter: { itemId: event.itemId },
              update: { $set: { winner: event.winner, claimed: true } }
            }
          });
          return acc;
        case 'OfferCanceled':
          acc.updateEvents.push({
            updateOne: {
              filter: { itemId: event.itemId },
              update: { $set: { canceled: true } }
            }
          });
          return acc;
        case 'AuctionCanceled':
          acc.updateEvents.push({
            updateOne: {
              filter: { auctionId: event.auctionId },
              update: { $set: { canceled: true } }
            }
          });
          return acc;
        default:
          console.warn(`Unknown event type: ${event.type}`);
          return null;
      }
    },
    { insertEvents: [], updateEvents: [] }
  );
  await NftStatus.insertMany(insertEvents.filter(i => i));
  await NftStatus.bulkWrite(updateEvents.filter(i => i));
};

export const fetchMarketplaceEvents = async () => {
  let insertData = [];
  try {
    dotenv.config();
    const maxBlockNumber = await Event.find().sort({ blockNumber: -1 }).limit(1).lean();
    const fromBlock = maxBlockNumber[0] ? maxBlockNumber[0].blockNumber + 1 : 0;
    const provider = new ethers.providers.EtherscanProvider(Number('0x5'), process.env.ETHERSCAN_API_KEY);
    const marketplaceContract = new ethers.Contract(CONTRACTS['0x5'].MARKETPLACE.address, CONTRACTS['0x5'].MARKETPLACE.abi, provider);
    const events = await marketplaceContract.queryFilter('*', fromBlock);
    insertData = events.map(event => {
      const {
        blockNumber,
        transactionIndex,
        transactionHash,
        event: type,
        args: { itemId, auctionId, nft, price, tokenId, seller, buyer, timeToEnd }
      } = event;
      return {
        type,
        ...(itemId ? { itemId: ethers.BigNumber.from(itemId).toNumber() } : {}),
        ...(auctionId ? { auctionId: ethers.BigNumber.from(auctionId).toNumber() } : {}),
        nft,
        ...(price ? { price: ethers.BigNumber.from(price).toString() } : {}),
        ...(tokenId ? { tokenId: ethers.BigNumber.from(tokenId).toNumber() } : {}),
        seller,
        ...(buyer ? { buyer } : {}),
        ...(timeToEnd ? { timeToEnd: new Date(ethers.BigNumber.from(timeToEnd).toNumber()) } : {}),
        blockNumber,
        transactionIndex,
        transactionHash,
        network: '0x5'
      };
    });
    await Promise.all([Event.insertMany(insertData), getLastStatusOfNft(insertData)]);
  } catch (err) {
    console.log(err);
  }
  return insertData;
};