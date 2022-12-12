import React, { useEffect, useState } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import API from '../../modules/api';
import { ReactComponent as DefaultProfilePhoto } from '../../assets/default-profile-photo.svg';
import CreateIcon from '../../assets/add_circle_outline_white_24dp.svg';

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
    }
  }

  .dropdown-content {
    display: none;
    flex-direction: column;
  }

  .dropdown-content a {
    color: white;
    text-decoration: none;
    padding: 8px;
    font-size: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &:hover .dropdown-content {
    display: flex;
  }

  .dropdown-create {
    position: absolute;
    left: -32px;
    display: flex;
    background-color: var(--button-background);
    border-radius: 10px;
    border: 2px solid var(--blue);
    transition: all 0.3s ease;
  }

  .dropdown-create:hover {
    background-color: var(--blue);
    border: 2px solid var(--button-background);
  }

  .dropdown-content img {
    padding-right: 8px;
  }
`;

const AccountBox = ({ account }) => {
  const [profilePhoto, setProfilePhoto] = useState('');

  useEffect(() => {
    API.getProfilePhoto(account).then(response => setProfilePhoto(response?.url));
  }, [account]);

  return (
    <ScAccountBox>
      <div className="accountBox-image-content">
        {profilePhoto ? (
          <img src={profilePhoto} className="accountBox-image" alt="accountImage" />
        ) : (
          <DefaultProfilePhoto className="accountBox-default" />
        )}
      </div>
      <div className="dropdown-content">
        <div className="dropdown-create">
          <Link to="/mint-nfts">
            <img src={CreateIcon} alt="Create" />
            Create
          </Link>
        </div>
      </div>
    </ScAccountBox>
  );
};

AccountBox.propTypes = {
  account: string
};

AccountBox.defaultProps = {
  account: ''
};

export default AccountBox;
