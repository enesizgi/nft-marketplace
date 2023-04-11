import React from 'react';
import styled from 'styled-components';
import { theme } from '../constants';

const ScButton = styled.button`
  margin-top: auto;
  background: ${theme.blue};
  color: #fff;
  transition: 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  > svg {
    margin-right: 10px;
    width: 20px;
    height: 20px;
    fill: #fff;
  }

  :not(.switch) {
    &:hover {
      filter: brightness(110%);
      box-shadow: 0 0 3px #fff;
    }
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
