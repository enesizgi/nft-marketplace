import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BiRefresh } from 'react-icons/bi';
import {
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
  const isOwnerPage = compare(owner, userId);

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
      if (isWindowFocused) {
        dispatch(loadNFT());
      }
    }, 15000);
    return () => {
      clearInterval(intervalId);
    };
  }, [isWindowFocused]);

  return (
    <ScNFTDetailHeader>
      <div className="nft-header-name">
        <div className="nft-header-name-nftName">
          <p className="nftTitle">{itemName}</p>
          <button type="button" className="refresh-button" onClick={handleReloadNftInfo}>
            <BiRefresh />
          </button>
          <NewTab url={url} />
          <ShareDropdown url={url} />
        </div>

        {!isOwnerPage && (
          <div className="nft-header-name-owner">
            <AddressDisplay address={seller || owner} label="Owned By" className="nft-header-name-owner-id" />
          </div>
        )}
      </div>
      {!isOwnerPage && <p className="nft-price">{formattedPrice} ETH</p>}
      {isOnAuction && <AuctionButton />}
      {(isListed || isOwnerPage) && <NFTActionButtons />}
    </ScNFTDetailHeader>
  );
};

export default NFTDetailHeader;
