import styled from 'styled-components';

const ScNFTDetailHeader = styled.div`
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
      display: flex;
      flex-direction: column;
      .header-buttons {
        align-self: flex-end;
        .refresh-button {
          width: 38px;
          height: 34px;
          margin-right: 16px;
          > svg {
            width: 100%;
            height: 100%;
          }
        }
      }
      &-id {
        max-width: 100%;
      }
    }
  }
  .nft-price {
    font-size: 24px;
  }
`;

export default ScNFTDetailHeader;
