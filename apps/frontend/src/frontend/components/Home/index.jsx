import React from 'react';
import { useSelector } from 'react-redux';
import { TabList, Tabs, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { getUserId } from '../../store/selectors';
import ListNFTSPage from '../ListNFTS';
import SearchBar from './SearchBar';

const HomePage = () => {
  const userId = useSelector(getUserId);

  return (
    <Tabs variant="enclosed" color="white">
      <TabList>
        <Tab>Listed NFTs</Tab>
        <Tab>Search</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <ListNFTSPage profileId={userId} selectedTab="Home" />
        </TabPanel>
        <TabPanel>
          <SearchBar />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default HomePage;
