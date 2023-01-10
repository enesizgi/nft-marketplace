import React from 'react';
import { useSelector } from 'react-redux';
import { getUserID } from '../../store/selectors';
import ListNFTSPage from '../ListNFTS';

const HomePage = () => {
  const userID = useSelector(getUserID);
  return <ListNFTSPage profileID={userID} selectedTab="Home" />;
};

export default HomePage;
