import React from 'react';
import { useSelector } from 'react-redux';
import { getUserId } from '../../store/selectors';
import ListNFTSPage from '../ListNFTS';

const HomePage = () => {
  const userId = useSelector(getUserId);
  return <ListNFTSPage profileId={userId} selectedTab="Home" />;
};

export default HomePage;
