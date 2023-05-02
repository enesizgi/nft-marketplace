import React from 'react';
import styled from 'styled-components';
import { theme } from '../../constants';

const ScCoolButton = styled.div`
  &:hover {
    background: ${theme.secondaryBlue};
  }
  border: 2px solid ${theme.secondaryBlue};
  border-radius: 10px;
  @media screen and (max-width: 480px) {
    border: 0;
  }
  height: 100%;
  display: flex;
  align-items: center;
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.blue};
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    padding: 8px 8px;
    transition: 0.2s;
  }
`;

const CoolButton = ({ children, onClick, isDropdownOpened }) => (
  <ScCoolButton isDropdownOpened={isDropdownOpened}>
    <button type="button" onClick={onClick}>
      {children}
    </button>
  </ScCoolButton>
);

export default CoolButton;
