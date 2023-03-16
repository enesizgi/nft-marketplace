import React from 'react';
import styled from 'styled-components';

const ScDropdown = styled.div`
  width: 180px;
  position: relative;
  border: 2px solid ${({ theme }) => theme.blue};
  border-radius: 10px;
  overflow: hidden;

  .dropdown-content-item {
    width: 100%;
    padding: 8px;
    z-index: 1;
    display: flex;
    background-color: ${({ theme }) => theme.buttonBackground};
    font-size: 20px;
    flex-direction: row;
    align-items: center;
    transition: all 0.2s ease;
    text-decoration: none;
    color: #fff;

    &:visited {
      color: #fff;
    }

    &:hover {
      background-color: ${({ theme }) => theme.blue};
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