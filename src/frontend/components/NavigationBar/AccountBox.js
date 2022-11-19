import React, { useEffect, useState } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import API from '../../modules/api';

const ScAccountBox = styled.div`
  display: inline-block;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #000;
  border-radius: 100%;
  .accountBox-image {
    height: 100%;
    width: 100%;
    border-radius: 100%;
  }
`;

const AccountBox = ({ account }) => {
  const [profilePhoto, setProfilePhoto] = useState('');

  useEffect(() => {
    API.getProfilePhoto(account).then(response => setProfilePhoto(response.url));
  }, []);

  return (
    <ScAccountBox>
      <img src={profilePhoto} className="accountBox-image" alt="accountImage" />
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
