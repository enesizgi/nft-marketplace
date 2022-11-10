import React from 'react';
import { Link } from 'react-router-dom';

import './NavigationBar.css';

const NavigationBar = ({ web3Handler, loading }) => {
  return (
    <div className="navigationItemContainer">
      <div className="navigationItem">NFT Marketplace</div>
      <div className="navigationItem"><Link to="/">Home</Link></div>
      <div className="navigationItem"><Link to="/mint-nfts">Mint NFTS</Link></div>
      <div className="navigationItem"><Link to="/my-listed-nfts">My Listed NFTS</Link></div>
      <div className="navigationItem"><Link to="/my-purchases">My Purchases</Link></div>
      <div className="navigationItem"><button onClick={web3Handler}>{ loading ? 'Connect Wallet' : 'Connected'}</button> </div>
    </div>
  );
}

export default NavigationBar;