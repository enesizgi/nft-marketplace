import React from 'react';
import styled from 'styled-components';
import { classNames } from '../utils';
import { theme } from '../constants';

const ScSwitch = styled.div`
  background: ${theme.secondaryBlue};
  display: flex;
  width: 400px;
  align-items: center;
  padding: 5px 8px;
  border-radius: 8px;
  @media screen and (max-width: 480px) {
    width: 300px;
  }
  .switch-item {
    width: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 90%;
    border-radius: 8px;
    padding: 8px 16px;
    background: ${theme.secondaryBlue};
    color: ${theme.blue};
    font-size: 24px;
    @media screen and (max-width: 768px) {
      font-size: 18px;
    }
    &.selected {
      color: #fff;
      background: ${theme.blue};
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
    }
  }
`;

const Switch = ({ keys, selected, onChange }) => (
  <ScSwitch>
    {keys.map(key => (
      <button
        key={key}
        type="button"
        className={classNames({
          'switch-item': true,
          selected: selected === key
        })}
        onClick={() => onChange(key)}
      >
        {key}
      </button>
    ))}
  </ScSwitch>
);

export default Switch;
