import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import OnOutsideClick from 'react-outclick';
import CoolButton from './CoolButton';
import EthereumLogo from '../../assets/ethereum-logo.png';
import { ReactComponent as LocalhostIcon } from '../../assets/localhost-icon.svg';
import { CHAIN_PARAMS, DEVICE_TYPES, NETWORK_LOGOS, theme } from '../../constants';
import { getChainIdWithDefault, getDeviceType, getUserId } from '../../store/selectors';
import Dropdown from '../Dropdown';
import { setChainId } from '../../store/marketplaceSlice';
import { changeNetwork } from '../../utils';

const ScNetworkSelector = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  height: 100%;
  > div {
    height: 100% !important;
    width: 100% !important;
  }

  .title-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    position: relative;
    div {
      border-radius: 8px;
    }
    button {
      height: 100%;
    }
    &-title {
      .network-name {
        margin-left: 8px;
      }
    }
  }

  svg,
  img {
    width: 80%;
    height: 80%;
    fill: ${theme.blue};
    > * {
      fill ${theme.blue};
    }
    margin-right: 12px;
    @media screen and (max-width: 480px) {
      margin-right: 0;
      width: 100%;
      height: 100%;
    }
  }

  .dropdown-content {
    margin-top: 10px;
    position: absolute;
    top: 100%;
    right: 0;
  }
`;

const NetworkSelector = () => {
  const dispatch = useDispatch();
  const [isDropdownOpened, setDropdownOpened] = useState(false);
  const chainId = useSelector(getChainIdWithDefault);
  const deviceType = useSelector(getDeviceType);
  const userId = useSelector(getUserId);

  // TODO @Enes: Reload homepage after changing network
  // TODO @Enes: Add localhost to networks
  const handleNetworkChange = networkId => async () => {
    if (!userId) {
      dispatch(setChainId(networkId));
    } else if (window.ethereum) {
      const result = await changeNetwork(networkId);
      // Network change is critical, so we reload the page.
      if (result) window.location.reload();
    }
    setDropdownOpened(false);
  };

  const { src: Logo, type: logoType } = NETWORK_LOGOS[chainId] || {};
  const isLocalhost = window.location.hostname === 'localhost';

  return (
    <ScNetworkSelector isDropdownOpened={isDropdownOpened}>
      <OnOutsideClick onOutsideClick={() => setDropdownOpened(false)}>
        <div className="title-container">
          <CoolButton className="title-container-title" onClick={() => setDropdownOpened(!isDropdownOpened)} isDropdownOpened={isDropdownOpened}>
            {logoType === 'svg' && <Logo className="title-container-logo" />}
            {logoType && logoType !== 'svg' && <img src={Logo} alt="network logo" className="title-container-logo" />}
            {deviceType !== DEVICE_TYPES.MOBILE && <div className="network-name">{CHAIN_PARAMS[chainId]?.chainName ?? 'Unknown'}</div>}
          </CoolButton>
        </div>
        {isDropdownOpened && (
          <Dropdown>
            {isLocalhost && (
              <button type="button" className="dropdown-content-item" onClick={handleNetworkChange('0x7a69')}>
                <LocalhostIcon className="dropdown-content-item-icon" />
                <div className="dropdown-container-network-title">Localhost</div>
              </button>
            )}
            {/* <button type="button" className="dropdown-content-item" onClick={handleNetworkChange('0xaa36a7')}> */}
            {/*  <img src={EthereumLogo} alt="ethereum-logo" className="dropdown-content-item-icon" /> */}
            {/*  <div className="dropdown-container-network-title">Sepolia</div> */}
            {/* </button> */}
            <button type="button" className="dropdown-content-item" onClick={handleNetworkChange('0x5')}>
              <img src={EthereumLogo} alt="ethereum-logo" className="dropdown-content-item-icon" />
              <div className="dropdown-container-network-title">Goerli</div>
            </button>
            {/* <button type="button" className="dropdown-content-item" onClick={handleNetworkChange('0x89')}> */}
            {/*  <PolygonLogo className="dropdown-content-item-icon" /> */}
            {/*  <div className="dropdown-container-network-title">Polygon</div> */}
            {/* </button> */}
          </Dropdown>
        )}
      </OnOutsideClick>
    </ScNetworkSelector>
  );
};

export default NetworkSelector;
