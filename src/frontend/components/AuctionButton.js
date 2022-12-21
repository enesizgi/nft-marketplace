import React from 'react';
import { useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { getMarketplaceContract, getNFTContract, getUserID } from '../store/selectors';
/* eslint-disable */
const AuctionButton = ({ item }) => {
  const nftContract = useSelector(getNFTContract);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const userID = useSelector(getUserID);
  const [minimumBid, setMinimumBid] = React.useState(null);
  const [expireTime, setExpireTime] = React.useState(null);
  const [makeBid, setMakeBid] = React.useState(null);
  const startAuctionHandler = async () => {
    if (!expireTime || !minimumBid) return;
    const price = ethers.utils.parseEther(minimumBid.toString());
    const untilDate = Math.floor(new Date(expireTime).getTime() / 1000);
    // await (await marketplaceContract.makeItem(nftContract.address, item., listingPrice)).wait();
    console.log(marketplaceContract, nftContract);
    console.log('item', item);
    // approve marketplace to spend nft
    const isApproved = await nftContract.isApprovedForAll(userID, marketplaceContract.address);
    if (!isApproved) {
      await (await nftContract.setApprovalForAll(marketplaceContract.address, true)).wait();
    }
    await (await marketplaceContract.startAuction(nftContract.address, item.tokenId, price, untilDate)).wait();
  };
  const makeBidHandler = async () => {
    if (makeBid <= parseInt(ethers.utils.formatEther(item.price), 10)) return;
    console.log('makeBidHandler');
    const price = ethers.utils.parseEther(makeBid.toString());
    await (await marketplaceContract.makeOffer(item.auctionId, { value: price })).wait();
  };

  const claimNFTHandler = async () => {
    console.log('claimNFTHandler');
    await (await marketplaceContract.claimNFT(item.auctionId)).wait();
  };
  const now = Math.floor(new Date().getTime() / 1000);
  const isAuctionOver = item.auctionId && now > parseInt(item.timeToEnd._hex, 16);

  if (!userID) {
    return null;
  }
  return (
    <>
      {item.auctionId !== undefined && !isAuctionOver && (
        <>
          Current Price: {ethers.utils.formatEther(item.price)} ETH. Winner: {item.winner}{' '}
        </>
      )}
      {item.auctionId !== undefined && isAuctionOver && (
        <>
          Auction is over. Final Price: {ethers.utils.formatEther(item.price)} ETH. Winner: {item.winner}
        </>
      )}
      {item.auctionId === undefined && (
        <>
          Minimum Bid: <input type="number" placeholder="Price in ETH" onChange={e => setMinimumBid(e.target.value)} />
          <button type="button" onClick={startAuctionHandler}>
            Start Auction
          </button>
          Expire Time: <input type="datetime-local" onChange={e => setExpireTime(e.target.value)} />
        </>
      )}
      {item.auctionId !== undefined && item.seller.toLowerCase() !== userID && !isAuctionOver && (
        <>
          Bid Price: <input type="number" placeholder="Price in ETH" onChange={e => setMakeBid(e.target.value)} />
          <button type="button" onClick={makeBidHandler}>
            Make Bid
          </button>
        </>
      )}
      {isAuctionOver && item.winner.toLowerCase() === userID && (
        <button type="button" onClick={claimNFTHandler}>
          Claim NFT
        </button>
      )}
    </>
  );
};

export default AuctionButton;
