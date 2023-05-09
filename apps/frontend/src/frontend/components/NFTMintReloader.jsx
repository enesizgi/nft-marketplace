import React, { useState } from 'react';
import MintNFTSPage from './MintNFTSPage';

const NFTMintReloader = () => {
  const [reloadCount, setReloadCount] = useState(0);
  const increaseReloadCount = () => setReloadCount(prev => prev + 1);

  return <MintNFTSPage key={reloadCount} reload={increaseReloadCount} />;
};

export default NFTMintReloader;
