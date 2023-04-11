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
  backdrop-filter: blur(20px);

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

    @media screen and (max-width: 480px) {
      font-size: 18px;
    }

    &.logo {
      overflow: hidden;
      border: 0;
      border-radius: 8px;
      padding: 0;
      object-fit: cover;
      transition: 0.2s;
      height: 80px;
      width: 80px;
      @media screen and (max-width: 768px) {
        height: 65px;
        width: 65px;
      }
      @media screen and (max-width: 480px) {
        height: 60px;
        width: 60px;
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
      height: 80px;
      width: 80px;
      flex-shrink: 0;
      text-align: center;

      @media screen and (max-width: 768px) {
        height: 65px;
        width: 65px;
      }

      @media screen and (max-width: 480px) {
        height: 60px;
        width: 60px;
      }
    }
    &.networkSelector {
      margin-left: auto;
      margin-right: 16px;
    }
  }

  .cartIcon {
    margin-right: 16px;
    background: none;
    padding: 8px;
    border-radius: 8px;
    transition: 0.2s;
    :hover {
      background: ${theme.secondaryBlue};
    }
    & > svg {
      fill: ${theme.blue};
      width: 40px;
      height: 40px;
    }
  }
`;

export default ScNavigationBar;
