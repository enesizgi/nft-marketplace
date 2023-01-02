import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getDeviceType, getIsListed, getIsOnAuction, getNFTOwner, getUserID } from '../../store/selectors';
import AuctionButton from '../AuctionButton';
import NFTDetailBox from './NFTDetailBox';
import NFTDetailImage from './NFTDetailImage';
import NFTDetailHeader from './NFTDetailHeader';
import NFTDetailActivity from './NFTDetailActivity';
import { DEVICE_TYPES } from '../../constants';
import ScNFTDetailPage from './ScNFTDetailPage';
import SaleButton from './SaleButton';

const NFTDetailPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  const deviceType = useSelector(getDeviceType);
  const userID = useSelector(getUserID);
  const owner = useSelector(getNFTOwner);
  const isListed = useSelector(getIsListed);
  const isOnAuction = useSelector(getIsOnAuction);
  const isOwner = owner?.toLowerCase() === userID.toLowerCase();

  useEffect(() => {
    if (owner) {
      setIsLoading(false);
    }
  }, [owner]);

  if (isLoading) {
    return (
      <main style={{ padding: '1rem 0' }}>
        <h2>Loading...</h2>
      </main>
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
