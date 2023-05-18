import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BiRefresh } from 'react-icons/bi';
import { ethers } from 'ethers';
import {
  getChainId,
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
import { CHAIN_PARAMS } from '../../../constants';

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
  const chainId = useSelector(getChainId);
  const [blockNumber, setBlockNumber] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(0);
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
    setLastUpdate(blockNumber);
    dispatch(loadNFT());
  };

  const getBlockNumber = async () => {
    const rpcUrl = CHAIN_PARAMS[chainId].rpcUrls[0];
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    return provider.getBlockNumber();
  };

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const blockNo = await getBlockNumber();
      if (blockNumber !== blockNo) setBlockNumber(blockNo);
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [blockNumber]);

  useEffect(() => {
    if (isWindowFocused && lastUpdate !== blockNumber) {
      setLastUpdate(blockNumber);
      dispatch(loadNFT());
    }
  }, [blockNumber, isWindowFocused, lastUpdate]);

  return (
    <ScNFTDetailHeader>
      <div className="nft-header-name">
        <div className="nft-header-name-nftName">
          <p className="nftTitle">{itemName}</p>
        </div>
        <div className="nft-header-name-owner">
          {!isOwnerPage && <AddressDisplay address={seller || owner} label="Owned By" className="nft-header-name-owner-id" />}
          <div className="header-buttons">
            <button type="button" className="refresh-button" onClick={handleReloadNftInfo}>
              <BiRefresh />
            </button>
            <NewTab url={url} />
            <ShareDropdown url={url} />
          </div>
        </div>
      </div>
      {!isOwnerPage && isListed && (
        <p className="nft-price">
          <strong>{formattedPrice} ETH</strong>
        </p>
      )}
      {isOwnerPage && isListed && (
        <p className="nft-price">
          Listed for <strong>{formattedPrice} ETH</strong>
        </p>
      )}
      {isOnAuction && <AuctionButton />}
      {(isListed || isOwnerPage) && <NFTActionButtons />}
    </ScNFTDetailHeader>
  );
};

export default NFTDetailHeader;
