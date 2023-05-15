import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import isNil from 'lodash/isNil';
import { getAuctionId, getChainId, getDeviceType, getNFTOwner, getUserId } from '../../store/selectors';
import NFTDetailBox from './NFTDetailBox';
import NFTDetailImage from './NFTDetailImage';
import NFTDetailHeader from './NFTDetailHeader';
import NFTDetailActivity from './NFTDetailActivity';
import { DEVICE_TYPES } from '../../constants';
import ScNFTDetailPage from './ScNFTDetailPage';
import LoadingSpinner from '../LoadingSpinner';
import NFTOfferActivity from './NFTOfferActivity';
import BidActivity from './BidActivity';
import { loadNFT } from '../../store/uiSlice';

const NFTDetailPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const chainId = useSelector(getChainId);
  const userId = useSelector(getUserId);
  const deviceType = useSelector(getDeviceType);
  const owner = useSelector(getNFTOwner);
  const auctionId = useSelector(getAuctionId);

  const dispatch = useDispatch();

  useEffect(() => {
    if (owner) {
      setIsLoading(false);
    }
  }, [owner]);

  useEffect(() => {
    if (chainId) {
      dispatch(loadNFT());
    }
  }, [chainId, userId]);

  if (isLoading) {
    return (
      <div style={{ width: '100%', height: 'calc(100% - 100px)' }}>
        <LoadingSpinner message="Loading NFT" />
      </div>
    );
  }

  return (
    <ScNFTDetailPage>
      {deviceType !== DEVICE_TYPES.DESKTOP && <NFTDetailHeader />}
      <div className="item-summary">
        <NFTDetailImage />
        <NFTDetailBox />
      </div>
      <div className="item-main">
        {deviceType === DEVICE_TYPES.DESKTOP && <NFTDetailHeader />}
        {!isNil(auctionId) && <BidActivity />}
        <NFTDetailActivity />
        <NFTOfferActivity />
      </div>
    </ScNFTDetailPage>
  );
};

export default NFTDetailPage;
