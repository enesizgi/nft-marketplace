import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { getMarketplaceContract, getNFTContract, getUserId } from '../../store/selectors';
import { classNames } from '../../utils';
import { getNFTMetadata } from '../utils';
import { NFT_LISTING_TYPES, theme } from '../../constants';
import Button from '../Button';
import { loadNFT, setActiveModal, setLoading } from '../../store/uiSlice';

const ScSellModal = styled.div`
  width: 100%;
  @media screen and (max-width: 768px) {
    height: 100%;
  }

  display: flex;
  flex-direction: column;

  .nft-overview {
    display: flex;
    width: 100%;
    margin-bottom: 20px;

    &-image {
      width: 30%;
      height: auto;
    }

    &-text {
      width: 70%;
      margin-left: 20px;
      display: flex;
      flex-direction: column;

      &-name {
        font-size: 48px;
      }

      &-description {
        font-size: 18px;
      }
    }
  }

  .nft-sell-options {
    display: flex;
    align-self: center;
    width: 40%;
    justify-content: space-around;
    align-items: center;
    margin: 20px 0;
  }

  .nftSellOptionsButton {
    height: 50px;
    border: 3px solid ${theme.blue};
    font-size: 18px;
    font-weight: 600;
    margin: 0 20px;
  }

  .sell-fixed,
  .sell-auction {
    &-label {
      font-size: 18px;
      font-weight: 600;
    }
    &-input {
      display: flex;
      justify-content: space-between;
      width: 200px;
      height: 50px;
      align-items: center;
      border: 2px solid rgba(35, 37, 42, 0.7);
      border-radius: 10px;
      margin: 10px 0 20px;

      > input {
        height: 100%;
        width: 80%;
        border: 0;
        border-radius: 10px;
        padding: 10px;
        font-size: 18px;
        outline: none;
        -moz-appearance: textfield;

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
        }
      }

      #sell-auction-date {
        width: 100%;
      }

      &-eth {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20%;
        height: 100%;
        border-left: 2px solid rgba(35, 37, 42, 0.7);
        color: rgba(35, 37, 42, 0.7);
      }
    }
  }
  .sell-modal-footer {
    display: flex;
    flex-direction: column;
    margin-top: auto;
    > span {
      color: red;
    }
    > button {
      margin-top: 10px;
    }
  }
`;

const SellModal = ({ tokenId }) => {
  const [nftMetadata, setNFTMetadata] = useState({});
  const [selectedOption, setSelectedOption] = useState(NFT_LISTING_TYPES.FIXED_PRICE);
  const userId = useSelector(getUserId);
  const marketplaceContract = useSelector(getMarketplaceContract);
  const nftContract = useSelector(getNFTContract);

  const [sellPrice, setSellPrice] = useState('');
  const [expireTime, setExpireTime] = useState('');
  const [minimumBid, setMinimumBid] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();

  useEffect(async () => {
    const metadata = await getNFTMetadata(tokenId);
    setNFTMetadata(metadata);
  }, []);

  const handleSellNFT = async () => {
    dispatch(setLoading({ isLoading: true, message: 'The item is getting prepared for sale...' }));
    const isApproved = await nftContract.isApprovedForAll(userId, marketplaceContract.address);
    if (!isApproved) {
      await (await nftContract.setApprovalForAll(marketplaceContract.address, true)).wait();
    }
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(sellPrice.toString());
    try {
      await (await marketplaceContract.makeItem(nftContract.address, tokenId, listingPrice)).wait();
      dispatch(setLoading(false));
      dispatch(setActiveModal(''));
      dispatch(loadNFT());
    } catch (e) {
      setError('Transaction denied!');
      dispatch(setLoading(false));
    }
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
      await (await nftContract.setApprovalForAll(marketplaceContract.address, true)).wait();
    }

    try {
      await (await marketplaceContract.startAuction(nftContract.address, tokenId, minimumBidPrice, untilDate)).wait();
      dispatch(setLoading(false));
      dispatch(setActiveModal(''));
      dispatch(loadNFT());
    } catch (e) {
      setError('Transaction denied!');
      dispatch(setLoading(false));
    }
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

  return (
    <ScSellModal>
      <div className="nft-overview">
        <img className="nft-overview-image" src={nftMetadata.url} alt="nftImage" />
        <div className="nft-overview-text">
          <span className="nft-overview-text-name">{nftMetadata.name}</span>
          <span className="nft-overview-text-description">{nftMetadata.description}</span>
        </div>
      </div>
      <div className="nft-sell-options">
        <Button
          className={classNames({
            nftSellOptionsButton: true,
            light: selectedOption !== NFT_LISTING_TYPES.FIXED_PRICE
          })}
          onClick={() => setSelectedOption(NFT_LISTING_TYPES.FIXED_PRICE)}
        >
          Fixed Price
        </Button>
        <Button
          className={classNames({
            nftSellOptionsButton: true,
            light: selectedOption !== NFT_LISTING_TYPES.AUCTION
          })}
          onClick={() => setSelectedOption(NFT_LISTING_TYPES.AUCTION)}
        >
          Auction
        </Button>
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
