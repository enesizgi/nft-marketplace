import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import AccountBox from './AccountBox';
import { DEVICE_TYPES } from '../../constants';
import { ReactComponent as MenuIcon } from '../../assets/menu-icon.svg';
import { classNames } from '../../utils';
import { initMarketplace } from '../../store/actionCreators';
import { getDeviceType, getIsLeftPanelOpened, getIsLoadingContracts, getUserId } from '../../store/selectors';
import { setLeftPanelOpened } from '../../store/uiSlice';
import CoolButton from './CoolButton';
import NetworkSelector from './NetworkSelector';

const ScNavigationBar = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  height: 12%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  z-index: 1000;
  background: linear-gradient(rgba(21, 24, 39, 1) 0%, rgba(31, 35, 54, 1) 35%, rgba(51, 56, 80, 1) 100%);

  @media screen and (max-width: 768px) {
    height: 80px;
  }

  .navigationItem {
    height: 100%;
    box-sizing: border-box;
    color: white;
    font-size: 24px;
    text-decoration: none;
    display: flex;
    align-items: center;
    text-align: center;
    background: transparent;

    :not(.accountBox, .logoPlaceHolder, .menu, .isTablet, .isMobile) {
      cursor: pointer;
      border: 2px solid ${({ theme }) => theme.blue};
      border-radius: 10px;
      height: 70%;
      padding: 0 8px;
      transition: all 0.2s ease-in-out;
    }

    :not(.accountBox, .logoPlaceHolder, .menu):hover {
      background: ${({ theme }) => theme.blue};
      transform: translateX(10px);
    }

    .menu-icon {
      fill: #fff;
      height: 70%;
      width: 70%;
    }

    div {
      display: inline-block;
      color: white;
      text-decoration: none;
    }

    a:visited {
      color: white;
    }

    @media screen and (max-width: 480px) {
      font-size: 18px;
    }
  }

  .menu {
    transition: all 0.4s ease-in-out;
    order: -1;
    flex-shrink: 0;

    svg:hover {
      fill: ${({ theme }) => theme.blue};
      transform: scale(1.1);
    }
  }

  .accountBox {
    height: 80px;
    flex-shrink: 0;
    text-align: center;

    @media screen and (max-width: 768px) {
      height: 65px;
      width: 95px;
    }

    @media screen and (max-width: 480px) {
      height: 60px;
      width: 60px;
    }
  }
`;

const NavigationBar = () => {
  const dispatch = useDispatch();
  const userId = useSelector(getUserId);
  const deviceType = useSelector(getDeviceType);
  const isLeftPanelOpened = useSelector(getIsLeftPanelOpened);
  const isLoadingContracts = useSelector(getIsLoadingContracts);

  const isDesktop = deviceType === DEVICE_TYPES.DESKTOP;
  const isTablet = deviceType === DEVICE_TYPES.TABLET;
  const isMobile = deviceType === DEVICE_TYPES.MOBILE;

  const toggleLeftPanel = () => dispatch(setLeftPanelOpened(!isLeftPanelOpened));
  const handleInitMarketplace = () => dispatch(initMarketplace());

  return (
    <ScNavigationBar className="navigationItemContainer">
      <Link
        to="/"
        className={classNames({
          navigationItem: true,
          logoPlaceHolder: true,
          isDesktop,
          isTablet,
          isMobile
        })}
      >
        NFTAO
      </Link>
      {!isDesktop && (
        <button
          type="button"
          className={classNames({
            navigationItem: true,
            menu: true,
            isDesktop,
            isTablet,
            isMobile
          })}
          onClick={toggleLeftPanel}
        >
          <MenuIcon className="navigation-item menu-icon" alt="menuIcon" />
        </button>
      )}
      {/* TODO: consider overflow in navigation bar when search is implemented. */}
      {/* <Search /> */}
      {isLoadingContracts || !userId ? (
        <CoolButton onClick={handleInitMarketplace}>Connect</CoolButton>
      ) : (
        <>
          <NetworkSelector />
          <div className="navigationItem accountBox">
            <AccountBox />
          </div>
        </>
      )}
    </ScNavigationBar>
  );
};

export default NavigationBar;
