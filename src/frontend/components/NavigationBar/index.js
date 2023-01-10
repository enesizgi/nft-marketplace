import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './NavigationBar.css';
import AccountBox from './AccountBox';
import { DEVICE_TYPES } from '../../constants';
import { ReactComponent as MenuIcon } from '../../assets/menu-icon.svg';
import { classNames } from '../../utils';
import { initMarketplace } from '../../store/actionCreators';
import { getDeviceType, getIsLeftPanelOpened, getIsLoadingContracts, getUserId } from '../../store/selectors';
import { setLeftPanelOpened } from '../../store/uiSlice';
import Search from '../Search';

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
    <div className="navigationItemContainer">
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
      <Search />
      <div className="navigationItem accountBox">
        {isLoadingContracts || !userId ? (
          <button type="button" onClick={handleInitMarketplace}>
            Connect Wallet
          </button>
        ) : (
          <AccountBox />
        )}
      </div>
    </div>
  );
};

export default NavigationBar;
