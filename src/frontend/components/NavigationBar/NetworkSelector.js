import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import OnOutsideClick from 'react-outclick';
import CoolButton from './CoolButton';
import { ReactComponent as PolygonLogo } from '../../assets/polygon-logo.svg';
import EthereumLogo from '../../assets/ethereum-logo.png';
import HardhatLogo from '../../assets/hardhat-logo.png';
import { CHAIN_PARAMS, DEVICE_TYPES, NETWORK_LOGOS } from '../../constants';
import { getChainIdWithDefault, getDeviceType } from '../../store/selectors';

const ScNetworkSelector = styled.div`
  height: 100%;

  .title-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    div {
      border-radius: 8px;
    }
    &-title {
      .network-name {
        margin-left: 8px;
      }
    }
  }
  .dropdown-container {
    z-index: 100;
    position: relative;
    button:first-child {
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
    button:last-child {
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
    &-network {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      background-color: rgba(31, 35, 54, 1);
      padding: 12px;
      width: 100%;
      &-title {
        color: rgb(76, 130, 251);
        padding: 8px 0;
        font-size: 16px;
        font-weight: 600;
      }

      &:hover {
        background-color: rgb(66 71 94);
      }
    }
    transform: translate(-40px, -20px);
  }
  svg,
  img {
    width: 24px;
    height: 24px;
    margin-right: 12px;
    @media screen and (max-width: 480px) {
      margin-right: 0;
    }
  }
`;

const NetworkSelector = () => {
  const [isDropdownOpened, setDropdownOpened] = useState(false);
  const chainId = useSelector(getChainIdWithDefault);
  const deviceType = useSelector(getDeviceType);

  // TODO @Enes: Reload homepage after changing network
  // TODO @Enes: Add localhost to networks
  const handleNetworkChange = networkId => async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkId }] // chainId must be in hexadecimal numbers
      });
      setDropdownOpened(false);
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask
      // if it is not, then install it into the user MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CHAIN_PARAMS[networkId]]
          });
          setDropdownOpened(false);
        } catch (addError) {
          console.error(addError);
        }
      }
      console.error(error);
    }
  };

  const { type: logoType, src: Logo } = NETWORK_LOGOS[chainId] || {};
  const isLocalhost = window.location.hostname === 'localhost';

  return (
    <ScNetworkSelector>
      <div className="title-container">
        <CoolButton className="title-container-title" onClick={() => setDropdownOpened(prev => !prev)}>
          {logoType === 'svg' && <Logo />}
          {logoType && logoType !== 'svg' && <img src={Logo} alt="network logo" />}
          {deviceType !== DEVICE_TYPES.MOBILE && <div className="network-name">{CHAIN_PARAMS[chainId]?.chainName ?? 'Unknown'}</div>}
        </CoolButton>
      </div>
      {isDropdownOpened && (
        <OnOutsideClick onOutsideClick={() => setDropdownOpened(false)}>
          <div className="dropdown-container">
            {isLocalhost && (
              <button type="button" className="dropdown-container-network" onClick={handleNetworkChange('0x7a69')}>
                <img src={HardhatLogo} alt="ethereum-logo" />
                <div className="dropdown-container-network-title">Localhost</div>
              </button>
            )}
            <button type="button" className="dropdown-container-network" onClick={handleNetworkChange('0x5')}>
              <img src={EthereumLogo} alt="ethereum-logo" />
              <div className="dropdown-container-network-title">Goerli</div>
            </button>
            <button type="button" className="dropdown-container-network" onClick={handleNetworkChange('0x89')}>
              <PolygonLogo />
              <div className="dropdown-container-network-title">Polygon</div>
            </button>
          </div>
        </OnOutsideClick>
      )}
    </ScNetworkSelector>
  );
};

export default NetworkSelector;
