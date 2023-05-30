import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { getChainId, getMarketplaceContract, getNFTContract, getUserId } from '../../../store/selectors';
import { checkUserRejectedHandler, dispatchToastHandler, getNFTMetadata, waitConfirmHandler, waitTransactionHandler } from '../../utils';
import { NFT_LISTING_TYPES } from '../../../constants';
import Button from '../../Button';
import { loadNFT, setActiveModal, setLoading } from '../../../store/uiSlice';
import ScSellModal from './ScSellModal';
import Switch from '../../Switch';
import API from '../../../modules/api';

const SellModal = ({ tokenId, setCounter }) => {
  const [nftMetadata, setNFTMetadata] = useState({});
  const [selectedOption, setSelectedOption] = useState(NFT_LISTING_TYPES.FIXED_PRICE);
  const userId = useSelector(getUserId);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);
  const chainId = useSelector(getChainId);

  const [sellPrice, setSellPrice] = useState('');
  const [expireTime, setExpireTime] = useState('');
  const [minimumBid, setMinimumBid] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();

  const dispatchToast = dispatchToastHandler(dispatch);
  const checkForUserRejectedError = checkUserRejectedHandler(dispatchToast);
  const waitForTransaction = waitTransactionHandler(null, dispatchToast);

  useEffect(() => {
    const runAsync = async () => {
      const metadata = await getNFTMetadata(userId, chainId, tokenId);
      setNFTMetadata(metadata);
    };
    runAsync();
  }, []);

  const handleSellNFT = async () => {
    dispatch(setLoading({ isLoading: true, message: 'The item is getting prepared for sale...' }));
    const isApproved = await nftContract.isApprovedForAll(userId, marketplaceContract.address);
    if (!isApproved) {
      const waitForConfirm = waitConfirmHandler(
        async () => nftContract.setApprovalForAll(marketplaceContract.address, true),
        checkForUserRejectedError
      );
      const transaction = await waitForConfirm();
      if (transaction != null) {
        await waitForTransaction(transaction);
        const receipt = await waitForTransaction(transaction);
        if (receipt == null) {
          dispatch(setLoading(false));
          dispatch(loadNFT());
          return null;
        }
      }
    }
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(sellPrice.toString());
    try {
      const waitForConfirm = waitConfirmHandler(
        async () => marketplaceContract.makeItem(nftContract.address, tokenId, listingPrice),
        checkForUserRejectedError
      );
      const transaction = await waitForConfirm();
      await API.syncEvents({ chainId });
      if (transaction != null) {
        await waitForTransaction(transaction);
        dispatch(setActiveModal(''));
      }
    } catch (e) {
      console.error(e);
      return null;
    }
    dispatch(loadNFT());
    dispatch(setLoading(false));
    if (setCounter) {
      setCounter(prev => prev + 1);
    }
    return true;
  };

  const handleStartAuction = async () => {
    dispatch(setLoading({ isLoading: true, message: 'Starting auction...' }));
    if (!expireTime || !minimumBid) return;
    const minimumBidPrice = ethers.utils.parseEther(minimumBid.toString());
    const untilDate = Math.floor(new Date(expireTime).getTime() / 1000);
    if (untilDate < Math.floor(Date.now() / 1000)) return;
    // approve marketplace to spend nft
    const isApproved = await nftContract.isApprovedForAll(userId, marketplaceContract.address);
    if (!isApproved) {
      const waitForConfirm = waitConfirmHandler(
        async () => nftContract.setApprovalForAll(marketplaceContract.address, true),
        checkForUserRejectedError
      );
      const transaction = await waitForConfirm();
      if (transaction != null) {
        await waitForTransaction(transaction);
        const receipt = await waitForTransaction(transaction);
        if (receipt == null) {
          dispatch(setLoading(false));
          dispatch(loadNFT());
          await API.syncEvents({ chainId });
          dispatch(setActiveModal(''));
          return;
        }
      }
    }

    try {
      const waitForConfirm = waitConfirmHandler(
        async () => marketplaceContract.startAuction(nftContract.address, tokenId, minimumBidPrice, untilDate),
        checkForUserRejectedError
      );
      const transaction = await waitForConfirm();
      if (transaction != null) await waitForTransaction(transaction);
      await API.syncEvents({ chainId });
    } catch (e) {
      console.error(e);
    }
    dispatch(loadNFT());
    dispatch(setLoading(false));
    dispatch(setActiveModal(''));
  };

  const handleSellButtonClick = () => {
    if (selectedOption === NFT_LISTING_TYPES.FIXED_PRICE) {
      if (!sellPrice) {
        setError('You must enter a price to list this item.');
        return;
      }
      handleSellNFT(sellPrice);
    } else if (!!expireTime && !!minimumBid) {
      handleStartAuction(expireTime, minimumBid);
    } else {
      setError('You must enter a minimum bid and expiration time for the auction.');
    }
  };

  useEffect(() => {
    if (!!sellPrice || (!!expireTime && !!minimumBid)) {
      setError('');
    }
  }, [sellPrice, expireTime, minimumBid]);

  useEffect(() => {
    setError('');
  }, [selectedOption]);

  const keys = Object.values(NFT_LISTING_TYPES);

  return (
    <ScSellModal>
      <div className="nft-overview">
        <img className="nft-overview-image" src={nftMetadata.url} alt="nftImage" />
        <div className="nft-overview-text">
          <span className="nft-overview-text-name">{nftMetadata.name}</span>
          <span className="nft-overview-text-description">{nftMetadata.description}</span>
        </div>
      </div>
      <div className="nftSellOptionsToggle">
        <Switch keys={keys} onChange={setSelectedOption} selected={selectedOption} />
      </div>
      {/* TODO: fee calculations and price overview */}
      {selectedOption === NFT_LISTING_TYPES.FIXED_PRICE && (
        <div className="sell-fixed">
          <label className="sell-fixed-label" htmlFor="sell-number">
            Set a Price
          </label>
          <div className="sell-fixed-input">
            <input id="sell-number" type="number" onChange={e => setSellPrice(e.target.value)} value={sellPrice} />
            <span className="sell-fixed-input-eth">ETH</span>
          </div>
        </div>
      )}
      {selectedOption === NFT_LISTING_TYPES.AUCTION && (
        <div className="sell-auction">
          <label className="sell-auction-label" htmlFor="sell-auction-price">
            Minimum Bid
          </label>
          <div className="sell-auction-input">
            <input id="sell-auction-price" type="number" onChange={e => setMinimumBid(e.target.value)} value={minimumBid} />
            <span className="sell-fixed-input-eth">ETH</span>
          </div>
          <label className="sell-auction-label" htmlFor="sell-auction-date">
            Expire Time
          </label>
          <div className="sell-auction-input">
            <input id="sell-auction-date" type="datetime-local" onChange={e => setExpireTime(e.target.value)} value={expireTime} />
          </div>
        </div>
      )}
      <div className="sell-modal-footer">
        <span className="sell-modal-error">{error}</span>
        <Button onClick={handleSellButtonClick} className="sell-modal-button">
          Sell Item
        </Button>
      </div>
    </ScSellModal>
  );
};

export default SellModal;
