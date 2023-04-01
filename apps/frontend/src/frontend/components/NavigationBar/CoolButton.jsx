import React from 'react';
import styled from 'styled-components';
import { theme } from '../../constants';

const ScCoolButton = styled.div`
  background-color: ${theme.secondaryBlue};
  border-radius: 10px;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.blue};
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    padding: 8px 8px;
    transition: all 125ms ease-in 0s;

    &:hover {
      filter: brightness(120%);
    }
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
