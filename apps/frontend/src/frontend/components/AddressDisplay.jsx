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

  .address {
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

  const handleGoToAddress = e => {
    e.stopPropagation();
    navigate(`/user/${lowerAddress}`);
  };

  useEffect(() => {
    const runAsync = async () => {
      // TODO @Enes: Why is address 'Null' string?
      if (address && address.toLowerCase() !== 'null' && !showYou) {
        const { name } = (await API.getUsername(address.toLowerCase())) || {};
        if (name && name !== 'Unnamed') {
          setDisplayed(name);
        }
      }
    };
    runAsync();
  }, [address, showYou]);

  return (
    <ScAddressDisplay className={className}>
      <span className="label">{label && `${label}: `}</span>
      <button type="button" className="address" onClick={onClick || handleGoToAddress}>
        {showYou ? 'You' : displayed}
      </button>
    </ScAddressDisplay>
  );
};

export default AddressDisplay;
