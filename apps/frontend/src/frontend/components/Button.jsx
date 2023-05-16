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
    transition: 0.2s;
  }
  :not(.switch) {
    &:hover {
      filter: brightness(110%);
      box-shadow: 0 0 3px #fff;
    }
  }

  &.outline {
    background: none;
    border: 2px solid ${theme.blue};
    color: ${theme.blue};
    box-shadow: ${theme.blue} 0px 0px 5px;
    > svg {
      fill: ${theme.blue};
    }
    &:hover {
      box-shadow: none;
      filter: none;
      background: ${theme.blue};
      color: #fff;
      > svg {
        fill: #fff;
      }
    }
  }

  &.light {
    background: #fff;
    color: ${theme.blue};
  }

  &.cancel {
    background: ${theme.background};
    border: 3px solid red;
    box-shadow: 0 0 5px red;
    color: #fff;
    > svg {
      fill: #fff;
    }
    &:hover {
      background: red;
      box-shadow: 0 0 0;
    }
  }

  height: 50px;
  font-size: 18px;
  font-weight: 600;
  border: 0;
  border-radius: 10px;
  padding: 5px 15px;
  cursor: pointer;
  ${({ disabled }) => disabled && `pointer-events: none;`}
`;

const Button = ({ className, onClick, children, disabled }) => (
  <ScButton type="button" className={className} onClick={onClick} disabled={disabled}>
    {children}
  </ScButton>
);

export default Button;
