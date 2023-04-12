import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BiRefresh } from 'react-icons/bi';
import {
  getActiveModal,
  getFormattedPrice,
  getIsListed,
  getIsOnAuction,
  getNFTName,
  getNFTOwner,
  getNFTSeller,
  getNFTURL,
  getUserId
} from '../../../store/selectors';
import AddressDisplay from '../../AddressDisplay';
import ShareDropdown from '../ShareDropdown';
import '../ShareDropdown.css';
import NewTab from '../NFTOpenNewTab';
import { compare } from '../../../utils';
import { loadNFT } from '../../../store/uiSlice';
import NFTActionButtons from '../NFTActionButtons';
import AuctionButton from '../../AuctionButton';
import ScNFTDetailHeader from './ScNFTDetailHeader';

const NFTDetailHeader = () => {
  const dispatch = useDispatch();
  const userId = useSelector(getUserId);
  const itemName = useSelector(getNFTName);
  const owner = useSelector(getNFTOwner);
  const seller = useSelector(getNFTSeller);
  const url = useSelector(getNFTURL);
  const isListed = useSelector(getIsListed);
  const isOnAuction = useSelector(getIsOnAuction);
  const formattedPrice = useSelector(getFormattedPrice);
  const { type: modalType } = useSelector(getActiveModal);
  const isOwnerPage = seller ? compare(seller, userId) : compare(owner, userId);

  const [isWindowFocused, setIsWindowFocused] = useState(true);

  useEffect(() => {
    const onFocus = () => {
      if (!isWindowFocused) setIsWindowFocused(true);
    };
    const onBlur = () => {
      if (isWindowFocused) setIsWindowFocused(false);
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, [isWindowFocused]);

  const handleReloadNftInfo = () => {
    dispatch(loadNFT());
  };

  useEffect(() => {
    if (isWindowFocused) {
      dispatch(loadNFT());
    }
    const intervalId = setInterval(() => {
      if (isWindowFocused && !modalType) {
        dispatch(loadNFT());
      }
    }, 15000);
    return () => {
      clearInterval(intervalId);
    };
  }, [isWindowFocused, modalType, dispatch]);

  return (
    <ScNFTDetailHeader>
      <div className="nft-header-name">
        <div className="nft-header-name-nftName">
          <p className="nftTitle">{itemName}</p>
        </div>
        <div className="nft-header-name-owner">
          <AddressDisplay address={seller || owner} label="Owned By" className="nft-header-name-owner-id" />
          <div className="header-buttons">
            <button type="button" className="refresh-button" onClick={handleReloadNftInfo}>
              <BiRefresh />
            </button>
            <NewTab url={url} />
            <ShareDropdown url={url} />
          </div>
        </div>
      </div>
      {!isOwnerPage && isListed && <p className="nft-price">{formattedPrice} ETH</p>}
      {isOwnerPage && isListed && <p className="nft-price">Listed for {formattedPrice} ETH</p>}
      {isOnAuction && <AuctionButton />}
      {(isListed || isOwnerPage) && <NFTActionButtons />}
    </ScNFTDetailHeader>
  );
};

export default NFTDetailHeader;
