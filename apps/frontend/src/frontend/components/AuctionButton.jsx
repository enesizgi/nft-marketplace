import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { getAuctionId, getMarketplaceContract, getNFTSeller, getPriceOfNFT, getTimeToEnd, getUserId, getWinner } from '../store/selectors';
import { loadNFT } from '../store/uiSlice';

const ScAuctionButton = styled.div`
  margin-bottom: 20px;
  border: 3px dashed ${({ theme }) => theme.blue};
  border-radius: 16px;
  padding: 16px;

  .item {
    margin-bottom: 8px;
  }

  .nftActionButton {
    background: none;
    border: 2px solid ${({ theme }) => theme.blue};
    cursor: pointer;
    padding: 8px 16px;
    font-size: 16px;
    transition: all 0.3s ease;
  }

  .nftActionButton:hover {
    background: ${({ theme }) => theme.blue};
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
    color: ${({ theme }) => theme.blue};
  }

  .address:hover {
    font-weight: bold;
  }

  // TODO @Enes: Check these two classes later.
  .sell-button {
    width: 30%;
    @media screen and (max-width: 768px) {
      width: 100%;
    }
    font-size: 24px;
    background: ${({ theme }) => theme.blue};
    color: #fff;
    border: 0;
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
  }

  .buy {
    margin: 20px 0;
  }
`;

const AuctionButton = () => {
  const dispatch = useDispatch();
  const marketplaceContract = useSelector(getMarketplaceContract);
  const userId = useSelector(getUserId);
  const auctionId = useSelector(getAuctionId);
  const price = useSelector(getPriceOfNFT);
  const winner = useSelector(getWinner);
  const seller = useSelector(getNFTSeller);

  const timeToEnd = useSelector(getTimeToEnd);
  const [makeBid, setMakeBid] = React.useState(null);

  const navigate = useNavigate();

  const makeBidHandler = async () => {
    if (makeBid <= parseInt(ethers.utils.formatEther(price.toString()), 10)) return;
    const bidPrice = ethers.utils.parseEther(makeBid.toString());
    await (await marketplaceContract.makeOffer(auctionId, { value: bidPrice })).wait();
    await (await marketplaceContract.makeOffer(auctionId, { value: bidPrice })).wait();
    dispatch(loadNFT());
  };

  const claimNFTHandler = async () => {
    await (await marketplaceContract.claimNFT(auctionId)).wait();
    dispatch(loadNFT());
  };
  const now = Math.floor(new Date().getTime() / 1000);
  /* eslint-disable no-underscore-dangle */
  const isAuctionOver = auctionId && now > timeToEnd;
  const auctionEndTime = auctionId && new Date(timeToEnd * 1000).toString();
  const handleGoToProfile = id => () => {
    navigate(`/user/${id}`);
  };

  const handleCancelAuction = async () => {
    await (await marketplaceContract.cancelAuction(auctionId)).wait();
    dispatch(loadNFT());
  };

  if (!userId) {
    return null;
  }

  return (
    <ScAuctionButton>
      {auctionId && !isAuctionOver && (
        <>
          <div className="item">{`Sale ends at ${auctionEndTime}`}</div>
          <div className="item price">{ethers.utils.formatEther(price.toString())} ETH</div>
        </>
      )}
      {auctionId && isAuctionOver && (
        <>
          {winner.toLowerCase() === userId ? (
            <div className="item">Sale Ended. You won the auction!</div>
          ) : (
            <div className="item">Auction is over.</div>
          )}
          <div className="item price">{ethers.utils.formatEther(price.toString())} ETH</div>
        </>
      )}
      {auctionId && (
        <div>
          Winner:
          <button type="button" className="item address" onClick={handleGoToProfile(winner)}>
            {winner.toLowerCase() === userId ? 'You' : winner}
          </button>
        </div>
      )}
      {auctionId && !isAuctionOver && seller.toLowerCase() === userId && (
        <button type="button" className="sell-button buy" onClick={handleCancelAuction}>
          Cancel
        </button>
      )}
      {auctionId && seller.toLowerCase() !== userId && !isAuctionOver && (
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
      {isAuctionOver && (winner.toLowerCase() === userId || seller.toLowerCase() === userId) && (
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
