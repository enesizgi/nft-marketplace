import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { ethers } from 'ethers';
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
  white-space: pre;

  .address {
    font-weight: 600;
    :hover {
      text-decoration: underline;
    }
  }
`;

const AddressDisplay = ({ address, className, label, onClick, isShortAddress }) => {
  const userId = useSelector(getUserId);
  const navigate = useNavigate();
  const lowerAddress = address?.toLowerCase();
  const displayAddress = isShortAddress ? `${lowerAddress.slice(0, 6)}...${lowerAddress.slice(lowerAddress.length - 4)}` : lowerAddress;
  const [displayed, setDisplayed] = useState(displayAddress);
  const showYou = compare(lowerAddress, userId);
  const isNullAddress = address === ethers.constants.AddressZero;

  const handleGoToAddress = e => {
    e.stopPropagation();
    navigate(`/user/${lowerAddress}`);
  };

  useEffect(() => {
    const runAsync = async () => {
      if (address && !isNullAddress && !showYou) {
        try {
          const response = await API.getUsername(address.toLowerCase());
          if (response?.name && response.name !== 'Unnamed') {
            setDisplayed(response.name);
          }
        } catch (error) {
          console.log('error', error);
        }
      }
    };
    runAsync();
  }, [address, showYou]);

  return (
    <ScAddressDisplay className={className}>
      <span className="label">{label && `${label}: `}</span>
      {!isNullAddress ? (
        <button type="button" className="address" onClick={onClick || handleGoToAddress}>
          {showYou ? 'You' : displayed}
        </button>
      ) : (
        'NullAddress'
      )}
    </ScAddressDisplay>
  );
};

export default AddressDisplay;
