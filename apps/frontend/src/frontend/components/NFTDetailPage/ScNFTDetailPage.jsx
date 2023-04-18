import styled from 'styled-components';

const ScNFTDetailPage = styled.div`
  display: flex;
  flex-direction: row;
  padding: 16px;
  width: 100%;

  @media screen and (max-width: 768px) {
    flex-direction: column;
  }

  .item-summary {
    width: calc(40% - 10px);
    margin-right: 10px;
    @media screen and (max-width: 768px) {
      width: 100%;
    }

    @media screen and (max-width: 480px) {
    }
  }

  .item-main {
    margin-left: 10px;
    width: calc(60% - 10px);

    @media screen and (max-width: 768px) {
      width: 100%;
      margin: 0;
    }

    @media screen and (max-width: 480px) {
    }
  }
`;

export default ScNFTDetailPage;
