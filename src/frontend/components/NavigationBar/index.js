/* eslint-disable react/prop-types */
// TODO @Enes: Remove all eslint disables
import React from 'react';
import { Link } from 'react-router-dom';

import './NavigationBar.css';
import AccountBox from './AccountBox';
import { DEVICE_TYPES } from '../../constants';
import { ReactComponent as MenuIcon } from '../../assets/menu-icon.svg';

/* eslint-disable react/button-has-type */
const NavigationBar = ({
  web3Handler, loading, account, deviceType, toggleLeftPanel
}) => (
  <div className="navigationItemContainer">
    <div className="navigationItem">NFT Marketplace</div>
    { deviceType === DEVICE_TYPES.DESKTOP ? (
      <>
        <div className="navigationItem"><Link to="/">Home</Link></div>
        <div className="navigationItem"><Link to="/mint-nfts">Mint NFTS</Link></div>
        <div className="navigationItem"><Link to="/my-listed-nfts">My Listed NFTS</Link></div>
        <div className="navigationItem"><Link to="/my-purchases">My Purchases</Link></div>
      </>
    ) : (
      <div className="navigationItem menu" onClick={toggleLeftPanel}>
        <MenuIcon className="navigation-item menu-icon" alt="menuIcon" />
      </div>
    )}
    <div className="navigationItem accountBox">
      { loading ? (
        <button onClick={web3Handler}>Connect Wallet</button>
      ) : (
        <Link to={`/user/${account}`}>
          <AccountBox account={account} />
        </Link>
      )}

    </div>
  </div>
);

export default NavigationBar;
