import React from 'react';
import styled from 'styled-components';

const ScDropdown = styled.div`
  position: relative;
  border: 2px solid ${({ theme }) => theme.blue};
  border-radius: 10px;
  overflow: hidden;
  z-index: 100;

  .dropdown-content-item {
    width: 100%;
    padding: 8px;
    z-index: 1;
    display: flex;
    background-color: ${({ theme }) => theme.background};
    font-size: 20px;
    flex-direction: row;
    align-items: center;
    transition: all 0.2s ease;
    text-decoration: none;
    color: #fff;
    white-space: nowrap;

    &:visited {
      color: #fff;
    }

    &:hover {
      background-color: ${({ theme }) => theme.secondaryBlue};
    }

    &-icon {
      width: 32px;
      height: 32px;
      padding-right: 8px;
      fill: #fff;
    }
  }
`;
const Dropdown = ({ children }) => <ScDropdown className="dropdown-content">{children}</ScDropdown>;

export default Dropdown;
