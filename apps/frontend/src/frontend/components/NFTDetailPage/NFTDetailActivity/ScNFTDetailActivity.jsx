import styled from 'styled-components';
import { theme } from '../../../constants';

const ScNFTDetailActivity = styled.table`
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  color: #fff;

  .nft-activity-title {
    width: 100%;
    height: 50px;
    font-size: 18px;
  }

  .nft-activity-content {
    width: 100%;
    :hover {
      background: ${theme.secondaryBlue};
      transition: 0.2s ease;
    }
    &-item {
      width: 25%;
      height: 40px;
      text-align: center;
      font-size: 16px;
      padding: 5px;
      overflow: hidden;
    }

    border-top: 1px solid rgba(35, 37, 42, 0.3);
  }
  .cancelButton {
    height: 40px;
    margin: 5px auto;
    font-size: 16px;
  }
`;

export default ScNFTDetailActivity;
