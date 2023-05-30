import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, FormLabel, Input } from '@chakra-ui/react';
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
import { checkUserRejectedHandler, dispatchToastHandler, waitConfirmHandler, waitTransactionHandler, getPermitSignature } from './utils';

const ScAuctionButton = styled.div`
  margin-bottom: 20px;
  margin-top: 20px;
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
  const wEthContract = useSelector(getwETHContract);
  const userId = useSelector(getUserId);
  const auctionId = useSelector(getAuctionId);
  const tokenId = useSelector(getTokenId);
  const basePrice = useSelector(getPriceOfNFT);
  const bids = useSelector(getNFTBids);
  const seller = useSelector(getNFTSeller);
  const chainId = useSelector(getChainId);

  const timeToEnd = useSelector(getTimeToEnd);
  const [makeBid, setMakeBid] = React.useState(null);

  const navigate = useNavigate();

  const winner = bids.length > 0 ? bids[0].bidder : seller;
  const price = bids.length > 0 ? ethers.BigNumber.from(bids[0].amount).toString() : basePrice;

  const dispatchToast = dispatchToastHandler(dispatch);
  const checkForUserRejectedError = checkUserRejectedHandler(dispatchToast);
  const waitForTransaction = waitTransactionHandler(null, dispatchToast);

  const handleMakeBid = async () => {
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
    } catch (e) {
      console.log(e);
      checkForUserRejectedError(e);
    }
    dispatch(loadNFT());
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
      {auctionId && !isAuctionOver && (
        <>
          <p className="item">{`Sale ends at ${auctionEndTime}`}</p>
          <p className="item price">{ethers.utils.formatEther(price.toString())} ETH</p>
        </>
      )}
      {auctionId && bids.length > 0 && (
        <p>
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
            <Input type="number" id="bid-price" className="bid-price" placeholder="Price in ETH" onChange={e => setMakeBid(e.target.value)} />
          </p>
          <p className="item">
            <Button className="nftActionButton" onClick={handleMakeBid}>
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
