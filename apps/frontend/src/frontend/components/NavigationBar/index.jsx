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
import { ReactComponent as CartIcon } from '../../assets/cart-icon.svg';
import SearchBar from '../SearchBar';

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
      {isDesktop && (
        <div className="navigationItem searchBar">
          <SearchBar />
        </div>
      )}
      <div className="navigationItem button networkSelector">
        <NetworkSelector />
      </div>

      {userId && (
        <>
          <Link to="/cart" className="navigationItem button cartIcon">
            <CartIcon />
          </Link>
          <div className="navigationItem accountBox">
            <AccountBox />
          </div>
        </>
      )}
      {(isLoadingContracts || !userId) && (
        <div className="navigationItem button">
          <CoolButton onClick={handleInitMarketplace}>Connect</CoolButton>
        </div>
      )}
    </ScNavigationBar>
  );
};

export default NavigationBar;
