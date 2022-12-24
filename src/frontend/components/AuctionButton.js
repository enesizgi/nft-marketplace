import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { getMarketplaceContract, getNFTContract, getUserID } from '../store/selectors';

const ScAuctionButton = styled.div`
  margin-bottom: 20px;
  border: 3px dashed var(--blue);
  border-radius: 16px;
  padding: 16px;

  .item {
    margin-bottom: 8px;
  }

  .nftActionButton {
    background: none;
    border: 2px solid var(--blue);
    cursor: pointer;
    padding: 8px 16px;
    font-size: 16px;
    transition: all 0.3s ease;
  }

  .nftActionButton:hover {
    background: var(--blue);
    color: white;
  }

  .price {
    font-weight: bold;
    font-size: 20px;
  }

  .address {
    background: none;
    border: none;
    cursor: pointer;
    padding-left: 8px;
    font-size: 16px;
    color: var(--blue);
  }

  .address:hover {
    font-weight: bold;
  }
`;

const AuctionButton = ({ item }) => {
  const nftContract = useSelector(getNFTContract);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const userID = useSelector(getUserID);
  const [minimumBid, setMinimumBid] = React.useState(null);
  const [expireTime, setExpireTime] = React.useState(null);
  const [makeBid, setMakeBid] = React.useState(null);

  const navigate = useNavigate();
  const startAuctionHandler = async () => {
    if (!expireTime || !minimumBid) return;
    const price = ethers.utils.parseEther(minimumBid.toString());
    const untilDate = Math.floor(new Date(expireTime).getTime() / 1000);
    if (untilDate < Math.floor(Date.now() / 1000)) return;
    // approve marketplace to spend nft
    const isApproved = await nftContract.isApprovedForAll(userID, marketplaceContract.address);
    if (!isApproved) {
      await (await nftContract.setApprovalForAll(marketplaceContract.address, true)).wait();
    }
    await (await marketplaceContract.startAuction(nftContract.address, item.tokenId, price, untilDate)).wait();
  };
  const makeBidHandler = async () => {
    if (makeBid <= parseInt(ethers.utils.formatEther(item.price), 10)) return;
    const price = ethers.utils.parseEther(makeBid.toString());
    await (await marketplaceContract.makeOffer(item.auctionId, { value: price })).wait();
  };

  const claimNFTHandler = async () => {
    await (await marketplaceContract.claimNFT(item.auctionId)).wait();
  };
  const now = Math.floor(new Date().getTime() / 1000);
  /* eslint-disable no-underscore-dangle */
  const isAuctionOver = item.auctionId && now > parseInt(item.timeToEnd._hex, 16);
  const auctionEndTime = item.auctionId && new Date(parseInt(item.timeToEnd._hex, 16) * 1000).toString();

  const handleGoToProfile = id => () => {
    navigate(`/user/${id}`);
  };

  if (!userID) {
    return null;
  }
  return (
    <ScAuctionButton>
      {item.auctionId !== undefined && !isAuctionOver && (
        <>
          <div className="item">{`Sale ends at ${auctionEndTime}`}</div>
          <div className="item price">{ethers.utils.formatEther(item.price)} ETH</div>
        </>
      )}
      {item.auctionId !== undefined && isAuctionOver && (
        <>
          {item.winner.toLowerCase() === userID ? (
            <div className="item">Sale Ended. You won the auction!</div>
          ) : (
            <div className="item">Auction is over.</div>
          )}
          <div className="item price">{ethers.utils.formatEther(item.price)} ETH</div>
        </>
      )}
      {item.auctionId !== undefined && (
        <div>
          Winner:
          <button type="button" className="item address" onClick={handleGoToProfile(item.winner)}>
            {item.winner.toLowerCase() === userID ? 'You' : item.winner}
          </button>
        </div>
      )}
      {item.auctionId === undefined && (
        <>
          <div className="item">
            Minimum Bid: <input type="number" placeholder="Price in ETH" onChange={e => setMinimumBid(e.target.value)} />
          </div>
          <div className="item">
            Expire Time: <input type="datetime-local" onChange={e => setExpireTime(e.target.value)} />
          </div>
          <div className="item">
            <button type="button" className="nftActionButton" onClick={startAuctionHandler}>
              Start Auction
            </button>
          </div>
        </>
      )}
      {item.auctionId !== undefined && item.seller.toLowerCase() !== userID && !isAuctionOver && (
        <>
          <div className="item">
            Bid Price: <input type="number" placeholder="Price in ETH" onChange={e => setMakeBid(e.target.value)} />
          </div>
          <div className="item">
            <button type="button" className="nftActionButton" onClick={makeBidHandler}>
              Make Bid
            </button>
          </div>
        </>
      )}
      {isAuctionOver && (item.winner.toLowerCase() === userID || item.seller.toLowerCase() === userID) && (
        <div className="item">
          <button type="button" className="nftActionButton" onClick={claimNFTHandler}>
            Claim
          </button>
        </div>
      )}
    </ScAuctionButton>
  );
};

export default AuctionButton;
