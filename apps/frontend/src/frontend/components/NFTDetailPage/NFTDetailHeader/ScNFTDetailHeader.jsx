import styled from 'styled-components';

const ScNFTDetailHeader = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;

  @media screen and (max-width: 768px) {
    padding: 0;
    margin-bottom: 0;
  }

  .nft-header-name {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 20px;
    &-nftName {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
      height: 100%;
      width: 100%;
      font-size: 48px;
      font-weight: 600;
      word-wrap: break-word;

      @media screen and (max-width: 768px) {
        font-size: 36px;
      }

      .refresh-button {
        display: flex;
      }

      .btn-secondary {
        display: flex;
        margin: 0;
      }

      .nftTitle {
        flex: 80%;
      }
    }
    &-owner {
      width: 100%;
      &-id {
        max-width: 100%;
      }
    }
  }
`;

export default ScNFTDetailHeader;
