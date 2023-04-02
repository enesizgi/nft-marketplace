import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AccountBox from './AccountBox';
import { DEVICE_TYPES } from '../../constants';
import { classNames } from '../../utils';
import { initMarketplace } from '../../store/actionCreators';
import { getCurrentPath, getDeviceType, getIsLoadingContracts, getUserId } from '../../store/selectors';
import CoolButton from './CoolButton';
import NetworkSelector from './NetworkSelector';
import ScNavigationBar from './ScNavigationBar';
import { ReactComponent as LogoSvg } from '../../assets/nftao-logo.svg';

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
