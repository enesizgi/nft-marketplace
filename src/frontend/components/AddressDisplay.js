import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { getUserId } from '../store/selectors';
import API from '../modules/api';
import { compare } from '../utils';

const ScAddressDisplay = styled.p.attrs(props => ({
  className: props.className
}))`
  color: ${({ theme }) => theme.blue};
  display: inline-block;
  max-width: 100%;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  .label {
    color: #000;
  }
  .address {
    :hover {
      text-decoration: underline;
    }
  }
`;

const AddressDisplay = ({ address, className, label, onClick, isShortAddress }) => {
  const userId = useSelector(getUserId);
  const navigate = useNavigate();
  const lowerAddress = compare(userId, address) ? 'You' : address?.toLowerCase();
  const displayAddress = isShortAddress ? `${lowerAddress.slice(0, 6)}...${lowerAddress.slice(lowerAddress.length - 4)}` : lowerAddress;
  const [displayed, setDisplayed] = useState(displayAddress);

  const handleGoToAddress = e => {
    e.stopPropagation();
    navigate(`/user/${lowerAddress}`);
  };

  useEffect(async () => {
    if (displayAddress !== 'You') {
      const { name } = await API.getUsername(userId);
      if (name && name !== 'Unnamed') {
        setDisplayed(name);
      }
    }
  }, [userId]);

  return (
    <ScAddressDisplay className={className}>
      <span className="label">{label && `${label}: `}</span>
      <button type="button" className="address" onClick={onClick || handleGoToAddress}>
        {displayed}
      </button>
    </ScAddressDisplay>
  );
};

export default AddressDisplay;
