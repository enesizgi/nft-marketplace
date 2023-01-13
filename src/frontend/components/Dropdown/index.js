import React from 'react';
import styled from 'styled-components';

const ScDropdown = styled.div`
  width: 180px;
  position: relative;
  transform: translateX(-40px);
  border: 2px solid ${({ theme }) => theme.blue};
  border-radius: 10px;
  overflow: hidden;

  @media screen and (max-width: 768px) {
    width: 150px;
    transform: translateX(-60px);
  }

  @media screen and (max-width: 480px) {
    width: 150px;
    transform: translateX(-80px);
  }

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
