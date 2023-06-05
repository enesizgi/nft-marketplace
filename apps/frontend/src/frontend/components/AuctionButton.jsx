import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FormLabel, Input } from '@chakra-ui/react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import {
  getAuctionId,
  getChainId,
  getMarketplaceContract,
  getNFTBids,
  getNFTSeller,
  getPriceOfNFT,
  getTimeToEnd,
  getTokenId,
  getUserId,
  getwETHContract
} from '../store/selectors';
import { loadNFT } from '../store/uiSlice';
import API from '../modules/api';
import Button from './Button';
import { checkUserRejectedHandler, dispatchToastHandler, waitConfirmHandler, waitTransactionHandler, getPermitSignature } from './utils';
import { theme } from '../constants';
import LoadingSpinner from './LoadingSpinner';

const ScAuctionButton = styled.div`
  margin-bottom: 20px;
  margin-top: 20px;
  border: 3px solid ${theme.secondaryBlue};
  border-radius: 16px;
  padding: 16px;

  .item {
    margin-bottom: 8px;
  }

  .price {
    font-weight: bold;
    font-size: 36px;
  }

  label {
    font-weight: 600;
  }

  input {
    border: 1px solid ${theme.blue} !important;
  }

  .auction-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    @media screen and (max-width: 480px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .last-bid {
    margin-bottom: 8px;
  }

  .winner {
    @media screen and (min-width: 481px) {
      text-align: end;
    }
  }

  .address {
    background: none;
    border: none;
    cursor: pointer;
    padding-left: 8px;
    font-size: 16px;
    color: ${theme.blue};
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
    background: ${theme.blue};
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
  const wEthContract = useSelector(getwETHContract);
  const userId = useSelector(getUserId);
  const auctionId = useSelector(getAuctionId);
  const tokenId = useSelector(getTokenId);
  const basePrice = useSelector(getPriceOfNFT);
  const bids = useSelector(getNFTBids);
  const seller = useSelector(getNFTSeller);
  const chainId = useSelector(getChainId);
  const timeToEnd = useSelector(getTimeToEnd);
  const [makeBid, setMakeBid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const lastBid = bids.find(bid => bid.bidder.toLowerCase() === userId.toLowerCase());
  const winner = bids.length > 0 ? bids[0].bidder : seller;
  const price = bids.length > 0 ? ethers.BigNumber.from(bids[0].amount).toString() : basePrice;

  const dispatchToast = dispatchToastHandler(dispatch);
  const checkForUserRejectedError = checkUserRejectedHandler(dispatchToast);
  const waitForTransaction = waitTransactionHandler(null, dispatchToast);

  const handleMakeBid = async () => {
    setIsLoading(true);
    if (makeBid <= parseInt(ethers.utils.formatEther(price.toString()), 10)) {
      dispatchToast('Not enough price to make bid', 'error', 2000);
      return;
    }
    const bidPrice = ethers.utils.parseEther(makeBid.toString());

    const wETHbalance = await wEthContract.balanceOf(userId);

    if (wETHbalance.lt(bidPrice)) {
      dispatchToast('Not enough wETH', 'error', 2000);
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const deadline = new Date(timeToEnd).getTime() + 60 * 60 * 24; // timetoend check

    try {
      const { v, r, s } = await getPermitSignature(signer, wEthContract, marketplaceContract.address, bidPrice, deadline);
      const vStr = ethers.utils.hexlify(v);
      const rStr = ethers.utils.hexlify(r);
      const sStr = ethers.utils.hexlify(s);
      await API.createBid({ bidder: userId, amount: bidPrice, tokenId, deadline, v: vStr, r: rStr, s: sStr });
      setMakeBid(false);
      dispatchToast('Your bid is accepted.', 'success', 2000);
    } catch (e) {
      console.log(e);
      checkForUserRejectedError(e);
    }
    dispatch(loadNFT());
    setIsLoading(false);
  };

  const claimNFTHandler = async () => {
    try {
      const waitForConfirm = waitConfirmHandler(async () => marketplaceContract.claimNFT(auctionId), checkForUserRejectedError);
      const transaction = await waitForConfirm();
      if (transaction != null) await waitForTransaction(transaction);
      await API.syncEvents({ chainId });
    } catch (e) {
      console.error(e);
    }
    dispatch(loadNFT());
  };
  const now = Math.floor(new Date().getTime() / 1000);
  const isAuctionOver = auctionId && now > timeToEnd;
  const auctionEndTime = auctionId && new Date(timeToEnd * 1000).toLocaleString();
  const handleGoToProfile = id => () => {
    navigate(`/user/${id}`);
  };

  if (!userId) {
    return null;
  }

  return (
    <ScAuctionButton>
      {isLoading ? (
        <LoadingSpinner message="Your bid is being processed..." />
      ) : (
        <>
          {auctionId && !isAuctionOver && (
            <div className="auction-info">
              <p className="item price">{ethers.utils.formatEther(price.toString())} ETH</p>
              <p className="item">{`Sale ends at ${auctionEndTime}`}</p>
            </div>
          )}
          {auctionId && bids.length > 0 && (
            <p className="winner">
              Winner:
              <button type="button" className="item address" onClick={handleGoToProfile(winner)}>
                {winner.toLowerCase() === userId ? 'You' : winner}
              </button>
            </p>
          )}
          {auctionId && seller.toLowerCase() !== userId && !isAuctionOver && (
            <>
              <p className="item">
                <FormLabel htmlFor="bid-price">Bid Price:</FormLabel>
                <Input
                  type="number"
                  id="bid-price"
                  className="bid-price"
                  placeholder="Price in ETH"
                  value={makeBid}
                  onChange={e => setMakeBid(e.target.value)}
                />
              </p>
              {lastBid && (
                <p className="last-bid">
                  Your last bid: <strong>{ethers.utils.formatEther(lastBid.amount)} ETH</strong>
                </p>
              )}
              <p className="item">
                <Button className="nftActionButton outline" onClick={handleMakeBid}>
                  Make Bid
                </Button>
              </p>
            </>
          )}
          {isAuctionOver && (
            <div className="item">
              <div className="item">
                <LoadingSpinner message="Finalizing Auction..." />
              </div>
            </div>
          )}
        </>
      )}
    </ScAuctionButton>
  );
};

export default AuctionButton;
