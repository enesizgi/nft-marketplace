import styled from 'styled-components';
import { theme } from '../../constants';

const ScMintNFTSPage = styled.div`
  width: 70%;
  @media screen and (max-width: 480px) {
    width: 90%;
  }
  margin: 16px auto;
  .drop-container {
    display: flex;
    gap: 20px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 300px;
    @media screen and (max-width: 768px) {
      height: 200px;
    }
    padding: 20px;
    border-radius: 10px;
    border: 2px dashed ${theme.secondaryBlue};
    color: #fff;
    cursor: pointer;
    transition: 0.2s ease;
    margin: 20px auto;
    &:hover {
      background: ${theme.secondaryBlue};
    }
    .drop-title {
      font-size: 20px;
      font-weight: bold;
      text-align: center;
    }
    &.withImage {
      max-width: 80%;
      max-height: 80%;
      padding: 0;
      width: unset;
      height: unset;
    }
  }

  .formContainer {
    max-width: 450px;
    display: flex;
    flex-direction: column;
    width: 80%;
    margin: 0 auto;
    & > label {
      font-weight: 600;
      font-size: 24px;
    }
    & > input {
      height: 3rem;
      padding: 10px;
      font-size: 18px;
      color: #fff;
      margin-bottom: 20px;
    }
  }

  .listSwitch {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin: 20px 0 40px;
    & > label {
      font-size: 18px;
      margin: 0;
    }
  }

  .input-control.invalid {
    border: 1px solid red;
  }
`;

export default ScMintNFTSPage;
