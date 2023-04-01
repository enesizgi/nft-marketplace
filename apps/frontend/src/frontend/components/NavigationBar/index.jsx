import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import AccountBox from './AccountBox';
import { DEVICE_TYPES } from '../../constants';
import { classNames } from '../../utils';
import { initMarketplace } from '../../store/actionCreators';
import { getCurrentPath, getDeviceType, getIsLoadingContracts, getUserId } from '../../store/selectors';
import CoolButton from './CoolButton';
import NetworkSelector from './NetworkSelector';
import { ReactComponent as LogoSvg } from '../../assets/nftao-logo.svg';

const ScNavigationBar = styled.nav`
  position: sticky;
  z-index: 2000;
  width: 100%;
  height: 100px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  background: #0a101e;
  &.isHomepage {
    background: transparent;
  }
  backdrop-filter: blur(20px);

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

  .navigationItem.logo {
    overflow: hidden;
    border: 0;
    border-radius: 8px;
    padding: 0;
    object-fit: cover;
    transition: 0.2s;
    height: 70px;
    width: 70px;
    svg {
      margin: auto;
      width: 80%;
      height: 80%;
      fill: transparent;
      stroke: ${({ theme }) => theme.blue};
      stroke-width: 10px;
      transition: 0.2s;
    }
    &:hover {
      border: 0px solid #fff;
      svg {
        transform: scale(1.2, 1.2);
        fill: ${({ theme }) => theme.blue};
        stroke: #fff;
      }
    }
  }

  .accountBox {
    height: 80px;
    width: 80px;
    flex-shrink: 0;
    text-align: center;

    @media screen and (max-width: 768px) {
      height: 65px;
      width: 65px;
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
  const isLoadingContracts = useSelector(getIsLoadingContracts);
  const currentPath = useSelector(getCurrentPath);
  const navigationBarRef = useRef();

  const isDesktop = deviceType === DEVICE_TYPES.DESKTOP;
  const isTablet = deviceType === DEVICE_TYPES.TABLET;
  const isMobile = deviceType === DEVICE_TYPES.MOBILE;

  const handleInitMarketplace = () => dispatch(initMarketplace());

  return (
    <ScNavigationBar
      className={classNames({
        navigationItemContainer: true,
        isHomepage: currentPath === '/'
      })}
      ref={navigationBarRef}
    >
      <Link
        to="/"
        className={classNames({
          navigationItem: true,
          logoPlaceHolder: true,
          isDesktop,
          isTablet,
          isMobile,
          logo: true
        })}
      >
        <LogoSvg />
      </Link>

      {/* Meaningless until we have that pages...
      !isDesktop && (
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
      ) */}
      {/* TODO: consider overflow in navigation bar when search is implemented. */}
      {/* <Search /> */}
      <NetworkSelector />
      {userId && (
        <div className="navigationItem accountBox">
          <AccountBox />
        </div>
      )}
      {(isLoadingContracts || !userId) && <CoolButton onClick={handleInitMarketplace}>Connect</CoolButton>}
    </ScNavigationBar>
  );
};

export default NavigationBar;
