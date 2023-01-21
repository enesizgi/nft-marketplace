import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ScAddressDisplay = styled.a.attrs(props => ({
  className: props.className
}))`
  color: ${({ theme }) => theme.blue};
  display: inline-block;
  max-width: 100%;
  vertical-align: middle;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
  overflow: hidden;
  text-overflow: ellipsis;
  .label {
    color: #000;
  }
`;

const AddressDisplay = ({ address, className, label, onClick, isShortAddress }) => {
  const navigate = useNavigate();
  const lowerAddress = address?.toLowerCase();
  const displayAddress = isShortAddress ? `${lowerAddress.slice(0, 6)}...${lowerAddress.slice(lowerAddress.length - 4)}` : lowerAddress;
  const handleGoToAddress = e => {
    e.stopPropagation();
    navigate(`/user/${lowerAddress}`);
  };
  return (
    <ScAddressDisplay className={className} onClick={onClick || handleGoToAddress}>
      <span className="label">{label && `${label}: `}</span>
      {displayAddress}
    </ScAddressDisplay>
  );
};

export default AddressDisplay;
