import styled from 'styled-components';
import { theme } from '../../constants';

const ScNavigationBar = styled.nav`
  position: sticky;
  z-index: 2000;
  width: 100%;
  height: 100px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  background: #0a101e;
  &.isHomepage {
    background: transparent;
  }
  backdrop-filter: blur(5px);

  @media screen and (max-width: 768px) {
    height: 80px;
  }

  .navigationItem {
    box-sizing: border-box;
    color: white;
    font-size: 24px;
    text-decoration: none;
    display: flex;
    align-items: center;
    text-align: center;
    height: 64px;

    @media screen and (max-width: 768px) {
      height: 50px;
      font-size: 18px;
    }

    &.logo {
      overflow: hidden;
      border: 0;
      border-radius: 8px;
      padding: 0;
      object-fit: cover;
      transition: 0.2s;
      height: 70px;
      width: 70px;
      @media screen and (max-width: 768px) {
        height: 65px;
        width: 65px;
      }
      svg {
        margin: auto;
        width: 80%;
        height: 80%;
        fill: none;
        stroke: ${theme.blue};
        stroke-width: 10px;
        transition: 0.2s;
      }
      &:hover {
        border: 0px solid #fff;
        svg {
          transform: scale(1.2, 1.2);
          fill: ${theme.blue};
          stroke: #fff;
        }
      }
    }

    &.accountBox {
      flex-shrink: 0;
      text-align: center;
      height: 56px;
      width: 56px;
      @media screen and (max-width: 768px) {
        height: 50px;
        width: 50px;
      }
    }
    &.networkSelector {
      margin-left: auto;
      @media screen and (max-width: 480px) {
        margin-left: 30px;
      }
      margin-right: 30px;
    }
  }

  .cartIcon {
    margin-right: 30px;
    background: none;
    padding: 8px;
    border-radius: 8px;
    transition: 0.2s;
    :hover {
      background: ${theme.secondaryBlue};
    }
    & > svg {
      margin: 0 auto;
      fill: ${theme.blue};
      width: 90%;
      height: 90%;
    }
  }
`;

export default ScNavigationBar;
