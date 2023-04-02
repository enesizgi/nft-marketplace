import styled from 'styled-components';
import { theme } from '../../../constants';

const ScProfileContent = styled.div`
  width: 100%;
  padding: 0 2%;
  .profile-content-header {
    display: flex;
    border-bottom: 3px solid ${theme.blue};
    margin-bottom: 20px;
    height: 60px;
    @media screen and (max-width: 480px) {
      height: 40px;
    }
    width: 100%;
    &-title {
      border: none;
      background: none;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      padding: 16px;
      transition: transform 0.3s ease;
      opacity: 0.7;
      @media screen and (max-width: 480px) {
        font-size: 18px;
        padding: 8px;
      }
      > svg {
        fill: #fff;
        margin-right: 5px;
      }
    }

    &-title.isActive {
      opacity: 1;
      background: ${theme.blue};
    }

    &-title:hover:not(.isActive) {
      background: ${theme.secondaryBlue};
      cursor: pointer;
      opacity: 1;
    }
  }
`;

export default ScProfileContent;
