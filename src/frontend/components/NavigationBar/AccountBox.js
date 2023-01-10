import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ReactComponent as DefaultProfilePhoto } from '../../assets/default-profile-photo.svg';
import LogoutIcon from '../../assets/logout-icon.svg';
import CreateIcon from '../../assets/add_circle_outline_white_24dp.svg';
import { getUserID, getUserProfilePhoto } from '../../store/selectors';
import { resetUser } from '../../store/userSlice';

const ScAccountBox = styled.div`
  position: relative;
  z-index: 100;
  height: 100%;
  .accountBox-default {
    fill: #23252a;
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
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      border: 2px solid #0089a8;
      border-radius: 100%;
      position: relative;

      &::after {
        ${({ isDropdownOpened }) => (!isDropdownOpened ? 'display: none;' : '')}
        position: absolute;
        bottom: -12px;
        left: calc(50% - 5px);
        transform: rotateZ(45deg);
        content: ' ';
        width: 10px;
        height: 10px;
        background: var(--blue);
      }
    }
  }

  &:hover .dropdown-content {
    display: flex;
  }

  .dropdown-content {
    width: 250px;
    position: relative;
    flex-direction: column;
    transform: translateX(-170px);
    border: 2px solid var(--blue);
    border-radius: 10px;
    overflow: hidden;

    @media screen and (max-width: 480px) {
      width: 150px;
      transform: translateX(-80px);
    }

    &-item {
      width: 100%;
      padding: 8px;
      z-index: 1;
      display: flex;
      background-color: var(--button-background);
      font-size: 20px;
      display: flex;
      flex-direction: row;
      align-items: center;
      transition: all 0.2s ease;
      text-decoration: none;

      &:visited {
        color: #fff;
      }

      &:hover {
        background-color: var(--blue);
      }

      &-icon {
        width: 32px;
        height: 32px;
        padding-right: 8px;
        fill: #fff;
      }
    }
  }
`;

const AccountBox = () => {
  const [isDropdownOpened, setDropdownOpened] = useState(false);
  const profilePhoto = useSelector(getUserProfilePhoto);
  const userId = useSelector(getUserID);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(resetUser());
    sessionStorage.removeItem('account');
    sessionStorage.removeItem('chainId');
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
        <div className="dropdown-content">
          <Link to={`/user/${userId}`} className="dropdown-content-item" onClick={() => setDropdownOpened(!isDropdownOpened)}>
            <DefaultProfilePhoto className="dropdown-content-item-icon" />
            Profile
          </Link>
          <Link to="/mint-nfts" className="dropdown-content-item" onClick={() => setDropdownOpened(!isDropdownOpened)}>
            <img alt="create" src={CreateIcon} className="dropdown-content-item-icon" />
            Create
          </Link>
          <button type="button" className="dropdown-content-item" onClick={handleLogout}>
            <img alt="logout" src={LogoutIcon} className="dropdown-content-item-icon" />
            Logout
          </button>
        </div>
      )}
    </ScAccountBox>
  );
};

export default AccountBox;
