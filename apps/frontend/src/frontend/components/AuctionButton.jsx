import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, FormLabel, Input } from '@chakra-ui/react';
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

  .bid-price {
    margin-bottom: 8px;
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
          <p className="item">{`Sale ends at ${auctionEndTime}`}</p>
          <p className="item price">{ethers.utils.formatEther(price.toString())} ETH</p>
        </>
      )}
      {auctionId && isAuctionOver && (
        <>
          {winner.toLowerCase() === userId ? <p className="item">Sale Ended. You won the auction!</p> : <p className="item">Auction is over.</p>}
          <p className="item price">{ethers.utils.formatEther(price.toString())} ETH</p>
        </>
      )}
      {auctionId && (
        <p>
          Winner:
          <button type="button" className="item address" onClick={handleGoToProfile(winner)}>
            {winner.toLowerCase() === userId ? 'You' : winner}
          </button>
        </p>
      )}
      {auctionId && !isAuctionOver && seller.toLowerCase() === userId && (
        <button type="button" className="sell-button buy" onClick={handleCancelAuction}>
          Cancel
        </button>
      )}
      {auctionId && seller.toLowerCase() !== userId && !isAuctionOver && (
        <>
          <p className="item">
            <FormLabel htmlFor="bid-price">Bid Price:</FormLabel>
            <Input type="number" id="bid-price" className="bid-price" placeholder="Price in ETH" onChange={e => setMakeBid(e.target.value)} />
          </p>
          <p className="item">
            <Button className="nftActionButton" onClick={makeBidHandler}>
              Make Bid
            </Button>
          </p>
        </>
      )}
      {isAuctionOver && (winner.toLowerCase() === userId || seller.toLowerCase() === userId) && (
        <div className="item">
          <Button type="button" className="nftActionButton" onClick={claimNFTHandler}>
            Claim
          </Button>
        </div>
      )}
    </ScAuctionButton>
  );
};

export default AuctionButton;
