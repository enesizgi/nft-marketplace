import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getDeviceType, getIsListed, getIsOnAuction, getNFTOwner, getUserId } from '../../store/selectors';
import AuctionButton from '../AuctionButton';
import NFTDetailBox from './NFTDetailBox';
import NFTDetailImage from './NFTDetailImage';
import NFTDetailHeader from './NFTDetailHeader';
import NFTDetailActivity from './NFTDetailActivity';
import { DEVICE_TYPES } from '../../constants';
import ScNFTDetailPage from './ScNFTDetailPage';
import SaleButton from './SaleButton';
import LoadingSpinner from '../LoadingSpinner';

const NFTDetailPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  const deviceType = useSelector(getDeviceType);
  const userId = useSelector(getUserId);
  const owner = useSelector(getNFTOwner);
  const isListed = useSelector(getIsListed);
  const isOnAuction = useSelector(getIsOnAuction);
  const isOwner = owner?.toLowerCase() === userId.toLowerCase();

  useEffect(() => {
    if (owner) {
      setIsLoading(false);
    }
  }, [owner]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ScNFTDetailPage>
      {deviceType !== DEVICE_TYPES.DESKTOP && <NFTDetailHeader />}
      <div className="item-summary">
        <NFTDetailImage />
        <NFTDetailBox />
      </div>
      <div className="item-main">
        {deviceType === DEVICE_TYPES.DESKTOP && (
          <>
            <NFTDetailHeader />
            {isListed && <SaleButton />}
            {isOnAuction && <AuctionButton />}
            {isOwner && <SaleButton />}
          </>
        )}
        <NFTDetailActivity />
      </div>
    </ScNFTDetailPage>
  );
};

export default NFTDetailPage;
