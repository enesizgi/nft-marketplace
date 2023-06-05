import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { CONTRACTS, NETWORK_IDS } from 'contracts';
import Event from './models/event';
import Price from './models/price';
import NftStatus from './models/nft_status';
import Offer from './models/offer';
import Bid from './models/bid';

class EtherScanLimiter {
  constructor() {
    this.apiLimit = 5;
    this.apiCalls = 0;

    setInterval(() => {
      this.apiCalls = 0;
    }, 1000);
  }

  wait = async details => {
    if (details?.chainId === NETWORK_IDS.LOCALHOST) return;
    const cost = details?.cost ?? 1;
    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (this.apiLimit - this.apiCalls >= cost) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
    this.apiCalls += cost;
  };
}

export const etherscanLimiter = new EtherScanLimiter();

export const snakeToCamel = s => s.replace(/(_\w)/g, k => k[1].toUpperCase());

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

const deleteOldDocuments = async () => {
  const oldDocumentIds = await NftStatus.aggregate([
    {
      $group: {
        _id: {
          type: '$type',
          marketplaceContract: '$marketplaceContract',
          network: '$network',
          tokenId: '$tokenId'
        },
        docs: {
          $push: '$$ROOT'
        }
      }
    },
    {
      $set: {
        maxAuctionId: {
          $reduce: {
            input: '$docs',
            initialValue: {
              auctionId: -1
            },
            in: {
              $cond: [
                {
                  $gte: ['$$this.auctionId', '$$value.auctionId']
                },
                '$$this',
                '$$value'
              ]
            }
          }
        },
        maxItemId: {
          $reduce: {
            input: '$docs',
            initialValue: {
              itemId: -1
            },
            in: {
              $cond: [
                {
                  $gte: ['$$this.itemId', '$$value.itemId']
                },
                '$$this',
                '$$value'
              ]
            }
          }
        }
      }
    },
    {
      $set: {
        maxItemId: '$maxItemId.itemId',
        maxAuctionId: '$maxAuctionId.auctionId'
      }
    },
    {
      $set: {
        docs: {
          $filter: {
            input: '$docs',
            cond: {
              $ne: ['$$item.itemId', '$maxItemId']
            },
            as: 'item'
          }
        }
      }
    },
    {
      $set: {
        docs: {
          $filter: {
            input: '$docs',
            cond: {
              $ne: ['$$item.auctionId', '$maxAuctionId']
            },
            as: 'item'
          }
        }
      }
    },
    {
      $unwind: {
        path: '$docs'
      }
    },
    {
      $project: {
        _id: '$docs._id'
      }
    }
  ]);
  await NftStatus.deleteMany({ _id: { $in: oldDocumentIds.map(t => t._id) } });
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
            marketplaceContract: event.marketplaceContract,
            tokenId: event.tokenId,
            price: event.price,
            seller: event.seller,
            network: event.network,
            sold: false,
            canceled: false
          });
          return acc;
        case 'Bought':
          acc.updateEvents.push({
            updateOne: {
              filter: { type: 'Listing', itemId: event.itemId, network: event.network, marketplaceContract: event.marketplaceContract },
              update: { $set: { buyer: event.buyer, sold: true } }
            }
          });
          return acc;
        case 'AuctionStarted':
          acc.insertEvents.push({
            type: 'Auction',
            auctionId: event.auctionId,
            nft: event.nft,
            marketplaceContract: event.marketplaceContract,
            tokenId: event.tokenId,
            price: event.price,
            timeToEnd: event.timeToEnd,
            seller: event.seller,
            network: event.network,
            claimed: false,
            canceled: false
          });
          return acc;
        case 'AuctionEnded':
          acc.updateEvents.push({
            updateOne: {
              filter: { type: 'Auction', auctionId: event.auctionId, network: event.network, marketplaceContract: event.marketplaceContract },
              update: { $set: { winner: event.winner, claimed: true } }
            }
          });
          return acc;
        case 'OfferCanceled':
          acc.updateEvents.push({
            updateOne: {
              filter: { type: 'Listing', itemId: event.itemId, network: event.network, marketplaceContract: event.marketplaceContract },
              update: { $set: { canceled: true } }
            }
          });
          return acc;
        case 'AuctionCanceled':
          acc.updateEvents.push({
            updateOne: {
              filter: { type: 'Auction', auctionId: event.auctionId, network: event.network, marketplaceContract: event.marketplaceContract },
              update: { $set: { canceled: true } }
            }
          });
          return acc;
        case 'BidPlaced':
        case 'OwnershipTransferred':
          return acc;
        default:
          console.warn(`Unknown event type: ${event.type}`);
          return acc;
      }
    },
    { insertEvents: [], updateEvents: [] }
  );
  await NftStatus.insertMany(insertEvents.filter(i => i));
  await NftStatus.bulkWrite(updateEvents.filter(i => i));
  await deleteOldDocuments();
};

export const getProvider = chainId => {
  dotenv.config();
  const isLocalhost = chainId === NETWORK_IDS.LOCALHOST;
  return isLocalhost
    ? new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
    : new ethers.providers.EtherscanProvider(Number(chainId), process.env.ETHERSCAN_API_KEY);
};

export const getNftContract = chainId => {
  const provider = getProvider(chainId);
  return new ethers.Contract(CONTRACTS[chainId].NFT.address, CONTRACTS[chainId].NFT.abi, provider);
};

export const getMarketplaceContract = chainId => {
  const provider = getProvider(chainId);
  return new ethers.Contract(CONTRACTS[chainId].MARKETPLACE.address, CONTRACTS[chainId].MARKETPLACE.abi, provider);
};

export const getIsItemInSale = async (chainId, tokenId) => {
  const itemStatus = await NftStatus.findOne({
    nft: CONTRACTS[chainId].NFT.address,
    tokenId,
    network: chainId,
    type: 'Listing'
  }).lean();
  if (!itemStatus || !Object.keys(itemStatus).length) {
    return false;
  }
  const { canceled, sold } = itemStatus;
  return !canceled && !sold;
};

export const canAddedToShoppingList = async (chainId, tokenId, walletId) => {
  const nftContract = getNftContract(chainId);
  try {
    await etherscanLimiter.wait({ chainId });
    const owner = await nftContract.ownerOf(tokenId);
    if (owner.toLowerCase() === walletId.toLowerCase()) {
      return false;
    }
  } catch (e) {
    return false;
  }
  return getIsItemInSale(chainId, tokenId);
};

export const finishAuctions = async chainId => {
  dotenv.config();
  const endedAuctions = await NftStatus.aggregate([
    {
      $match: {
        type: 'Auction',
        network: chainId,
        claimed: false,
        canceled: false,
        timeToEnd: { $lte: new Date() }
      }
    },
    {
      $lookup: {
        from: 'bids',
        let: {
          id: '$tokenId'
          // TODO: Add chain and nftContract address.
          // chain: '$network',
          // nft: '$nftContract'
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$tokenId', '$$id']
                  }
                  // {
                  //   $eq: ['$network', '$$chain']
                  // },
                  // {
                  //   $eq: ['$nftContract', '$$nft']
                  // }
                ]
              }
            }
          }
        ],
        as: 'bids'
      }
    },
    {
      $set: {
        bids: {
          $sortArray: {
            input: '$bids',
            sortBy: {
              amount: -1
            }
          }
        }
      }
    },
    {
      $limit: 5
    }
  ]);
  const isLocalhost = chainId === NETWORK_IDS.LOCALHOST;
  const provider = isLocalhost
    ? new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
    : new ethers.providers.EtherscanProvider(Number(chainId), process.env.ETHERSCAN_API_KEY);
  const wallet = isLocalhost
    ? new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider)
    : new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  const marketplaceContract = new ethers.Contract(CONTRACTS[chainId].MARKETPLACE.address, CONTRACTS[chainId].MARKETPLACE.abi, wallet);
  const wEthContract = new ethers.Contract(CONTRACTS[chainId].wETH.address, CONTRACTS[chainId].wETH.abi, wallet);
  // eslint-disable-next-line no-restricted-syntax
  for await (const auction of endedAuctions) {
    await etherscanLimiter.wait({ chainId });
    const valid = await Promise.all(
      auction.bids.map(async bid => {
        const balance = await wEthContract.balanceOf(bid.bidder);
        const fbalance = parseFloat(ethers.utils.formatEther(balance));
        const famount = parseFloat(ethers.utils.formatEther(bid.amount.toString()));
        return fbalance >= famount ? bid : null;
      })
    );
    const validBids = valid.filter(bid => bid != null);

    let isConfirmed = false;
    // eslint-disable-next-line no-restricted-syntax
    for await (const bid of validBids) {
      try {
        const receipt = await (
          await marketplaceContract.claimNFT(
            CONTRACTS[chainId].wETH.address,
            auction.tokenId,
            auction.auctionId,
            bid.deadline,
            bid.bidder,
            ethers.BigNumber.from(bid.amount.toString()),
            bid.v,
            bid.r,
            bid.s
          )
        ).wait();
        // TODO: Check for transaction failure.
        console.log(receipt);
        await Bid.deleteMany({
          bidder: bid.bidder
        });
        isConfirmed = true;
        break;
      } catch (e) {
        console.error(e);
      }
    }

    if (!isConfirmed) {
      // TODO: Send nft to seller.
      await marketplaceContract.returnNftToSeller(auction.auctionId).wait();
    }

    try {
      await Bid.deleteMany({
        tokenId: auction.tokenId
      });
    } catch (err) {
      console.log(err);
    }
  }
};

export const fetchMarketplaceEvents = async chainId => {
  let insertData = [];
  try {
    dotenv.config();
    const isLocalhost = chainId === NETWORK_IDS.LOCALHOST;
    const provider = isLocalhost
      ? new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')
      : new ethers.providers.EtherscanProvider(Number(chainId), process.env.ETHERSCAN_API_KEY);
    const marketplaceContract = new ethers.Contract(CONTRACTS[chainId].MARKETPLACE.address, CONTRACTS[chainId].MARKETPLACE.abi, provider);
    const nftContract = new ethers.Contract(CONTRACTS[chainId].NFT.address, CONTRACTS[chainId].NFT.abi, provider);
    let [fromBlock, fromBlockTransfer] = await Promise.all([
      Event.find({ network: chainId, marketplaceContract: marketplaceContract.address }).sort({ blockNumber: -1 }).limit(1).lean(),
      Event.find({ network: chainId, type: 'Transfer' }).sort({ blockNumber: -1 }).limit(1).lean()
    ]);
    fromBlock = fromBlock.at(0) ? fromBlock.at(0).blockNumber + 1 : 0;
    fromBlockTransfer = fromBlockTransfer.at(0) ? fromBlockTransfer.at(0).blockNumber + 1 : 0;
    await etherscanLimiter.wait({ chainId, cost: 2 });
    const [events, nftEvents] = await Promise.all([
      marketplaceContract.queryFilter('*', fromBlock),
      nftContract.queryFilter('Transfer', fromBlockTransfer)
    ]);
    insertData = isLocalhost ? events.filter(e => e.blockNumber >= fromBlock) : events;
    insertData = insertData.map(event => {
      const {
        blockNumber,
        transactionIndex,
        logIndex,
        transactionHash,
        event: type,
        args: { itemId, auctionId, nft, price, tokenId, seller, buyer, timeToEnd, bidder, amount }
      } = event;
      return {
        type,
        ...(itemId ? { itemId: ethers.BigNumber.from(itemId).toNumber() } : {}),
        ...(auctionId ? { auctionId: ethers.BigNumber.from(auctionId).toNumber() } : {}),
        ...(nft ? { nft } : {}),
        marketplaceContract: CONTRACTS[chainId].MARKETPLACE.address,
        ...(price ? { price: ethers.BigNumber.from(price).toString() } : {}),
        ...(tokenId ? { tokenId: ethers.BigNumber.from(tokenId).toNumber() } : {}),
        ...(seller ? { seller } : {}),
        ...(buyer ? { buyer } : {}),
        ...(timeToEnd ? { timeToEnd: new Date(ethers.BigNumber.from(timeToEnd).toNumber() * 1000) } : {}),
        ...(bidder ? { bidder } : {}),
        ...(amount ? { amount: ethers.BigNumber.from(amount).toString() } : {}),
        blockNumber,
        transactionIndex,
        logIndex,
        transactionHash,
        network: chainId
      };
    });
    let nftInsertData = isLocalhost ? nftEvents.filter(e => e.blockNumber >= fromBlockTransfer) : nftEvents;
    nftInsertData = nftInsertData.map(event => {
      const {
        blockNumber,
        transactionIndex,
        logIndex,
        transactionHash,
        event: type,
        args: { tokenId, from, to }
      } = event;
      return {
        type,
        from,
        to,
        tokenId: ethers.BigNumber.from(tokenId).toNumber(),
        nft: CONTRACTS[chainId].NFT.address,
        blockNumber,
        transactionIndex,
        logIndex,
        transactionHash,
        network: chainId
      };
    });
    await Promise.all([Event.insertMany([...insertData, ...nftInsertData]), insertData.length > 0 && getLastStatusOfNft(insertData)]);
  } catch (err) {
    console.log(err);
  }
  return insertData;
};

export const fetchEthPrice = async () => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    await Price.findOneAndUpdate({ coin: 'Ethereum', symbol: 'ETH', currency: 'USD' }, { $set: { price: +data.ethereum.usd } }, { upsert: true });
  } catch (err) {
    console.log(err);
  }
};

export const safeJSONParse = json => {
  try {
    return json ? JSON.parse(json) : null;
  } catch (err) {
    return json;
  }
};

export const deleteOldOffers = async () => {
  try {
    const now = new Date();
    const fiveSecAfter = Math.floor(now.getTime() / 1000) + 5;
    await Offer.deleteMany({
      deadline: {
        $lte: fiveSecAfter
      }
    });
  } catch (error) {
    console.log(error);
  }
};
