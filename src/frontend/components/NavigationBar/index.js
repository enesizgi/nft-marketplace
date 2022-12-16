/* eslint-disable react/prop-types */
// TODO @Enes: Remove all eslint disables
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './NavigationBar.css';
import AccountBox from './AccountBox';
import { DEVICE_TYPES } from '../../constants';
import { ReactComponent as MenuIcon } from '../../assets/menu-icon.svg';
import { classNames } from '../../utils';
import { initMarketplace } from '../../store/actionCreators';
import { getIsLoadingContracts, getUserID } from '../../store/selectors';

/* eslint-disable react/button-has-type */
// TODO @Enes: Remove above eslint disable

/* eslint-disable jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */
// TODO @Emre: Remove above eslint disable

const pages = [{ path: '/', name: 'Home' }];

const NavigationBar = ({ deviceType, toggleLeftPanel }) => {
  const navigate = useNavigate();
  const isDesktop = deviceType === DEVICE_TYPES.DESKTOP;
  const isTablet = deviceType === DEVICE_TYPES.TABLET;
  const isMobile = deviceType === DEVICE_TYPES.MOBILE;

  const dispatch = useDispatch();

  const handleInitMarketplace = () => dispatch(initMarketplace());

  const isLoadingContracts = useSelector(getIsLoadingContracts);

  const userID = useSelector(getUserID);

  return (
    <div className="navigationItemContainer">
      <div
        className={classNames({
          navigationItem: true,
          logoPlaceHolder: true,
          isDesktop,
          isTablet,
          isMobile
        })}
      >
        NFT Marketplace
      </div>
      {isDesktop ? (
        <>
          {pages.map(page => (
            <button
              key={page.path}
              className={classNames({
                navigationItem: true,
                isDesktop,
                isTablet,
                isMobile
              })}
              type="button"
              onClick={() => navigate(page.path)}
            >
              {page.name}
            </button>
          ))}
        </>
      ) : (
        <div
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
        </div>
      )}
      <div className="navigationItem accountBox">
        {isLoadingContracts || !userID ? (
          <button onClick={handleInitMarketplace}>Connect Wallet</button>
        ) : (
          <Link to={`/user/${userID}`}>
            <AccountBox />
          </Link>
        )}
      </div>
    </div>
  );
};

export default NavigationBar;
