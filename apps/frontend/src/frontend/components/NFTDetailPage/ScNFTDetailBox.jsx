import styled from 'styled-components';

const ScNFTDetailBox = styled.div`
  .details-container {
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    :hover {
      background: rgba(35, 37, 42, 0.1);
      transition: 0.2s ease;
    }
  }

  .detail-name {
    line-height: 100%;
    font-size: 16px;
    font-weight: 600;
    width: 40%;
    word-wrap: break-word;
  }
  .detail-span {
    max-width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    line-height: 100%;
    width: 60%;
    text-align: end;
    vertical-align: middle;
    font-size: 16px;
  }

  .description-text {
    padding: 20px;
    font-size: 16px;
    word-wrap: break-word;
  }
`;

export default ScNFTDetailBox;
