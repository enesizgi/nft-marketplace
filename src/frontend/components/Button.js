import React from 'react';
import styled from 'styled-components';
import { theme } from '../constants';

const ScButton = styled.button`
  margin-top: auto;
  background: ${theme.blue};
  color: #fff;
  transition: 0.2s ease;

  &:hover {
    filter: brightness(110%);
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
  }

  &.light {
    background: #fff;
    color: ${theme.blue};
  }

  height: 50px;
  font-size: 18px;
  font-weight: 600;
  border: 0;
  border-radius: 10px;
  padding: 5px;
  cursor: pointer;
`;

const Button = ({ className, onClick, children }) => (
  <ScButton type="button" className={className} onClick={onClick}>
    {children}
  </ScButton>
);

export default Button;
