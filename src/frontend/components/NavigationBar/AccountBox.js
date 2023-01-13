import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import OnOutsideClick from 'react-outclick';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ReactComponent as DefaultProfilePhoto } from '../../assets/default-profile-photo.svg';
import LogoutIcon from '../../assets/logout-icon.svg';
import CreateIcon from '../../assets/add_circle_outline_white_24dp.svg';
import { getUserId, getUserProfilePhoto } from '../../store/selectors';
import { resetUser } from '../../store/userSlice';
import Dropdown from '../Dropdown';

const ScAccountBox = styled.div`
  width: 100%;
  position: relative;
  z-index: 100;
  height: 100%;
  .accountBox-default {
    fill: ${({ theme }) => theme.buttonBackground};
    background: #fff;
    height: 100%;
    width: 100%;
    border-radius: 100%;
  }
  .accountBox-image {
    height: 100%;
    width: 100%;
    border-radius: 100%;

    &-content {
      display: inline-block;
      height: 100%;
      box-sizing: border-box;
      border: 2px solid ${({ theme }) => theme.blue};
      border-radius: 100%;
      position: relative;
      transform: translateX(40px);

      @media screen and (max-width: 768px) {
        transform: translateX(20px);
      }

      @media screen and (max-width: 480px) {
        transform: translateX(10px);
      }

      &::after {
        ${({ isDropdownOpened }) => (!isDropdownOpened ? 'display: none;' : '')}
        position: absolute;
        bottom: -12px;
        left: calc(50% - 5px);
        transform: rotateZ(45deg);
        content: ' ';
        width: 10px;
        height: 10px;
        background: ${({ theme }) => theme.blue};
      }
    }
  }
`;

const AccountBox = () => {
  const [isDropdownOpened, setDropdownOpened] = useState(false);
  const profilePhoto = useSelector(getUserProfilePhoto);
  const userId = useSelector(getUserId);
  const dispatch = useDispatch();

  const handleLogout = e => {
    e.stopPropagation();
    dispatch(resetUser());
    sessionStorage.removeItem('account');
    sessionStorage.removeItem('chainId');
  };

  const handleDropdownClick = e => {
    e.stopPropagation();
    setDropdownOpened(!isDropdownOpened);
  };

  return (
    <ScAccountBox isDropdownOpened={isDropdownOpened}>
      <button type="button" className="accountBox-image-content" onClick={() => setDropdownOpened(!isDropdownOpened)}>
        {profilePhoto ? (
          <img src={profilePhoto} className="accountBox-image" alt="accountImage" />
        ) : (
          <DefaultProfilePhoto className="accountBox-default" />
        )}
      </button>
      {isDropdownOpened && (
        <OnOutsideClick onOutsideClick={() => setDropdownOpened(false)}>
          <Dropdown>
            <Link to={`/user/${userId}`} className="dropdown-content-item" onClick={handleDropdownClick}>
              <DefaultProfilePhoto className="dropdown-content-item-icon" />
              Profile
            </Link>
            <Link to="/mint-nfts" className="dropdown-content-item" onClick={handleDropdownClick}>
              <img alt="create" src={CreateIcon} className="dropdown-content-item-icon" />
              Create
            </Link>
            <button type="button" className="dropdown-content-item" onClick={handleLogout}>
              <img alt="logout" src={LogoutIcon} className="dropdown-content-item-icon" />
              Logout
            </button>
          </Dropdown>
        </OnOutsideClick>
      )}
    </ScAccountBox>
  );
};

export default AccountBox;
