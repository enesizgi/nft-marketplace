/* eslint-disable react/prop-types */
// TODO: Remove eslint disables
import React, { useState } from 'react';
import { string } from 'prop-types';
import { useLocation } from 'react-router-dom';
import { ReactComponent as ListedIcon } from '../../../assets/article_black_24dp.svg';
import { ReactComponent as PurchasedIcon } from '../../../assets/shopping_bag_black_24dp.svg';
import { classNames } from '../../../utils';
import ListNFTSPage from '../../ListNFTS';
import PurchasesPage from '../../Purchases';
import OwnedPage from '../../OwnedPage';
import ScProfileContent from './ScProfileContent';

const tabs = [
  { name: 'Listed', icon: ListedIcon },
  { name: 'Purchased', icon: PurchasedIcon },
  { name: 'Owned', icon: PurchasedIcon }
];

const ProfileContent = ({ id }) => {
  const location = useLocation();
  const [selectedTab, setSelectedTab] = React.useState(location?.state?.owned ? 'Owned' : tabs[0].name);
  const [counter, setCounter] = useState(0);

  return (
    <ScProfileContent>
      <div className="profile-content-header">
        {tabs.map(tab => (
          <button
            key={tab.name}
            type="button"
            className={classNames({
              'profile-content-header-title': true,
              isActive: selectedTab === tab.name
            })}
            onClick={() => setSelectedTab(tab.name)}
          >
            <tab.icon />
            {tab.name}
          </button>
        ))}
      </div>
      {selectedTab === 'Listed' && <ListNFTSPage profileId={id} selectedTab={selectedTab} />}
      {selectedTab === 'Purchased' && <PurchasesPage profileId={id} selectedTab={selectedTab} key={counter} setCounter={setCounter} />}
      {selectedTab === 'Owned' && <OwnedPage profileId={id} selectedTab={selectedTab} key={counter + 1} setCounter={setCounter} />}
    </ScProfileContent>
  );
};

ProfileContent.propTypes = {
  id: string
};

ProfileContent.defaultProps = {
  id: ''
};

export default ProfileContent;
