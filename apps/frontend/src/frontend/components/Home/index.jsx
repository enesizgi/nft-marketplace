import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { getDeviceType, getUserId } from '../../store/selectors';
import ListNFTSPage from '../ListNFTS';
import SearchBar from '../SearchBar';
import { DEVICE_TYPES } from '../../constants';

const ScHomePage = styled.div`
  padding: 0 16px;
  .homePage-search {
    display: flex;
    justify-content: center;
    align-items: center;
    width: calc(100% - 20px);
    margin: 30px 10px;
    > div {
      margin: auto;
      width: 100%;
      height: 60px;
    }
  }
`;

const HomePage = () => {
  const userId = useSelector(getUserId);
  const deviceType = useSelector(getDeviceType);

  return (
    <ScHomePage>
      {deviceType !== DEVICE_TYPES.DESKTOP && (
        <div className="homePage-search">
          <SearchBar />
        </div>
      )}
      <ListNFTSPage profileId={userId} selectedTab="Home" />
    </ScHomePage>
  );
};

export default HomePage;
